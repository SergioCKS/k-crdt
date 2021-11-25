//! # Clock
//!
//! An interface for clocks that poll time and output HLC/NTP timestamps.
use crate::time::timestamp::Timestamp;
use std::convert::TryFrom;
use std::fmt::{Debug, Display, Formatter};
use std::ops::Add;
use std::time::{Duration, SystemTimeError};
use wasm_bindgen::prelude::*;
#[cfg(test)]
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(feature = "client")]
use wasm_bindgen::JsCast;
use serde::{Serialize, Deserialize};

/// ## Maximum time offset
///
/// Maximum time offset (in seconds) for shifting time measurements.
pub const MAX_OFFSET: i64 = 31_556_952;

//#region Offset
/// ## Offset
///
/// Time offset in milliseconds.
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct Offset(i64); // bincode: 8 bytes

impl Offset {
    /// ### Zero offset
    ///
    /// Constructs an [`Offset`] with no duration.
    pub fn zero() -> Self { Self(0) }

    /// ### Create offset from milliseconds
    ///
    /// Constructs an [`Offset`] given the number of milliseconds (positive or negative).
    pub fn from_millis(offset_millis: i64) -> Self { Self(offset_millis) }

    /// ### As milliseconds
    ///
    /// Returns the offset as number of milliseconds (positive or negative).
    pub fn as_millis(&self) -> i64 { self.0 }
}

impl From<Offset> for Duration {
    /// ### Create duration from offset
    ///
    /// Returns the absolute value of the [`Offset`] as a [`Duration`].
    fn from(offset: Offset) -> Self {
        Duration::from_millis(offset.0.abs() as u64)
    }
}

impl From<Duration> for Offset {
    /// ### Offset from duration
    ///
    /// Converts a duration to an offset.
    ///
    /// * Durations are always non-negative.
    /// * If the duration is larger than the representation limit, the limit is used.
    fn from(duration: Duration) -> Self {
        let duration_millis = duration.as_millis();
        if duration_millis > i64::MAX as u128 {
            Self(i64::MAX)
        } else {
            Self(duration_millis as i64)
        }
    }
}

impl Add<Offset> for Offset {
    type Output = Self;

    /// ## Add offsets
    ///
    /// Addition of offsets.
    ///
    /// * Overflows are saturating (both for positive and negative offsets).
    fn add(self, rhs: Offset) -> Self::Output {
        Self(self.0.saturating_add(rhs.0))
    }
}
//#endregion

/// ## Clock (Trait)
///
/// A clock is capable of polling a time source and generating an HLC/NTP timestamp.
///
/// It should keep track of a time offset that is to be taken into consideration when polling the source.
pub trait Clock {
    /// ### Get offset
    ///
    /// Retrieve the offset of the clock.
    fn get_offset(&self) -> Offset;

    /// ### Set offset (unchecked)
    ///
    /// Sets the offset of the clock directly, without verifying if it is within the allowed limits.
    ///
    /// * `offset` - New offset
    fn set_offset_unchecked(&mut self, offset: Offset) -> ();

    /// ### Poll duration
    ///
    /// Returns a duration based on a time source.
    fn poll_duration() -> Result<Duration, TimePollError>;

    /// ### Set offset
    ///
    /// Update the offset of the clock.
    ///
    /// * `offset` - New offset.
    fn set_offset(&mut self, offset: Offset) -> Result<(), TimePollError> {
        //Check offset is within limits.
        if offset.as_millis().abs() > MAX_OFFSET {
            Err(TimePollError::OffsetTooLarge(format!(
                "The offset provided exceeds the permitted limit. Maximum allowed offset (in seconds): {}.",
                MAX_OFFSET
            )))
        } else {
            // Update the clock offset
            self.set_offset_unchecked(offset);
            Ok(())
        }
    }


    /// ### Time polling function
    ///
    /// A function that generates timestamps based on a time source taking the clock offset into
    /// consideration.
    fn poll_time(&self) -> Result<Timestamp, TimePollError> {
        let offset = self.get_offset();

        // Poll time from system.
        let now_duration = Self::poll_duration()?;

        // Apply offset.
        // println!("now_millis: {}, offset_millis: {}", now_millis, offset_millis);
        let millis = ((now_duration.as_millis() as i64) + offset.as_millis()) as u64;
        let shifted_duration = Duration::from_millis(millis);

        // Generate timestamp
        Ok(Timestamp::try_from(shifted_duration)?)
    }
}

//#region System time clock (test clock)
/// ## System Time Clock
///
/// A clock relying on [`SysTime`] as time source.
#[cfg(test)]
#[derive(Clone, Copy, Default)]
pub struct SysTimeClock {
    offset: Offset // bincode: 8 bytes
}

#[cfg(test)]
impl Clock for SysTimeClock {
    fn get_offset(&self) -> Offset {
        self.offset
    }

    fn set_offset_unchecked(&mut self, offset: Offset) -> () {
        self.offset = offset;
    }

    /// ### Poll time
    ///
    /// Polls the timesource using [`SysTime::now`].
    fn poll_duration() -> Result<Duration, TimePollError> {
        Ok(SystemTime::now().duration_since(UNIX_EPOCH)?)
    }
}
//#endregion

//#region Browser clock (Client)
/// ## Browser clock
///
/// A clock relying on browser APIs to poll time.
///
/// * The [`Performance` interface](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
///   is used to poll time. The time resolution is vendor-dependent, but is at least in the millisecond range.
#[cfg(feature = "client")]
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct BrowserClock {
    offset: Offset // bincode: 8 bytes
}

#[cfg(feature = "client")]
impl Clock for BrowserClock {
    fn get_offset(&self) -> Offset {
        self.offset
    }

    fn set_offset_unchecked(&mut self, offset: Offset) -> () {
        self.offset = offset;
    }

    fn poll_duration() -> Result<Duration, TimePollError> {
        if let Ok(value) =
            js_sys::Reflect::get(&js_sys::global(), &JsValue::from_str("performance"))
        {
            let performance = value.unchecked_into::<web_sys::Performance>();
            let now_micros = ((performance.time_origin() + performance.now()) * 1_000f64) as u64;
            Ok(Duration::from_micros(now_micros))
        } else {
            Err(TimePollError::PerformanceNotAccessible(String::from(
                "The performance object is not accessible. {}",
            )))
        }
    }
}
//#endregion ()

//#region Server clock
#[cfg(feature = "server")]
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct ServerClock;

#[cfg(feature = "server")]
impl Clock for ServerClock {
    fn get_offset(&self) -> Offset {
        Offset::default()
    }

    fn set_offset_unchecked(&mut self, _: Offset) -> () {
        ()
    }

    fn poll_duration() -> Result<Duration, TimePollError> {
        Ok(Duration::from_millis(js_sys::Date::now() as u64))
    }
}
//#endregion

//#region TimePollError
#[derive(Debug)]
pub enum TimePollError {
    SystemTimeError(String),
    TimestampParseError(String),
    OffsetTooLarge(String),
    WindowNotAccessible(String),
    PerformanceNotAccessible(String),
}

impl Display for TimePollError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match *self {
            Self::SystemTimeError(ref msg)
            | Self::TimestampParseError(ref msg)
            | Self::OffsetTooLarge(ref msg)
            | Self::WindowNotAccessible(ref msg)
            | Self::PerformanceNotAccessible(ref msg) => write!(f, "{}", msg),
        }
    }
}

impl From<TimePollError> for JsValue {
    fn from(err: TimePollError) -> Self {
        JsValue::from(err.to_string())
    }
}

impl From<SystemTimeError> for TimePollError {
    fn from(sys_time_error: SystemTimeError) -> Self {
        Self::SystemTimeError(format!("Could not poll time from system. {}", sys_time_error.to_string()))
    }
}
//#endregion

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sys_time_clock_works() {
        let mut clock = SysTimeClock::default();
        clock.poll_time().expect("System time polling without offset should work.");

        let neg_offset = Offset::from_millis(-400_000);
        let pos_offset = Offset::from_millis(400_000);
        let neg_too_large = Offset::from_millis(-(MAX_OFFSET + 1));
        let pos_too_large = Offset::from_millis(MAX_OFFSET + 1);

        clock.set_offset(neg_offset).unwrap();
        clock.poll_time().expect("System time polling with negative offset should work.");

        clock.set_offset(pos_offset).unwrap();
        clock.poll_time().expect("System time polling with positive offset should work.");

        for offset in vec![neg_too_large, pos_too_large] {
            if let TimePollError::OffsetTooLarge(msg) = clock.set_offset(offset)
                .expect_err("Time polling with offset too large should fail.") {
                assert!(msg.contains(&MAX_OFFSET.to_string()), "Error message should indicate offset limit.");
            } else {
                panic!("Incorrect error type: Expected `TimePollError:OffsetTooLarge`.")
            }
        }
    }
}
