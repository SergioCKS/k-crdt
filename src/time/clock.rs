//! # Clock
//!
//! An interface for clocks that poll time and output HLC/NTP timestamps.
use crate::time::timestamp::Timestamp;
use std::cmp::Ordering;
use std::convert::TryFrom;
use std::fmt::{Debug, Display, Formatter};
use std::ops::Add;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use serde::{Serialize, Deserialize};

/// ## Maximum time offset
///
/// Maximum time offset (in seconds) for shifting time measurements.
pub const MAX_OFFSET: u64 = 31_556_952;

//#region Offset (enum)
/// ## Offset
///
/// Signed duration to model time offsets.
#[derive(Clone, Copy)]
pub enum Offset {
    Negative(Duration),
    Positive(Duration),
}

impl Offset {
    /// ### Zero offset
    ///
    /// Constructs a positive [`Offset`] with no duration.
    pub fn zero() -> Self {
        Self::Positive(Duration::new(0, 0))
    }

    /// ### Create offset from milliseconds
    ///
    /// Constructs an [`Offset`] given the number of milliseconds (positive or negative).
    pub fn from_millis(offset_millis: i32) -> Self {
        let duration = Duration::from_millis(offset_millis.abs() as u64);
        if offset_millis < 0 {
            Self::Negative(duration)
        } else {
            Self::Positive(duration)
        }
    }

    /// ### Offset to milliseconds
    ///
    /// Returns the signed number of milliseconds represented by the offset.
    pub fn to_millis(&self) -> i32 {
        match *self {
            Self::Positive(duration) => duration.as_millis() as i32,
            Self::Negative(duration) => -(duration.as_millis() as i32),
        }
    }

    pub fn get_duration(&self) -> Duration {
        match *self {
            Self::Negative(d) | Self::Positive(d) => d,
        }
    }
}

impl Default for Offset {
    /// ### Default offset
    ///
    /// Constructs a default offset with zero value.
    fn default() -> Self {
        Self::zero()
    }
}

impl From<Offset> for Duration {
    /// ### Duration from offset
    ///
    /// Returns the offset duration ignoring its sign.
    fn from(offset: Offset) -> Self {
        match offset {
            Offset::Negative(duration) | Offset::Positive(duration) => duration,
        }
    }
}

impl From<Duration> for Offset {
    /// ### Offset from duration
    ///
    /// Returns a positive offset with the given duration as value.
    fn from(duration: Duration) -> Self {
        Self::Positive(duration)
    }
}

impl Add<Offset> for Offset {
    type Output = Self;

    /// ### Add offsets
    ///
    /// Handles addition of offsets taking their signs into consideration.
    fn add(self, rhs: Offset) -> Self::Output {
        match (self, rhs) {
            (Self::Negative(d1), Self::Negative(d2)) => Self::Negative(d1 + d2),
            (Self::Positive(d1), Self::Positive(d2)) => Self::Positive(d1 + d2),
            (Self::Negative(d1), Self::Positive(d2)) => {
                if let Ordering::Greater = d1.cmp(&d2) {
                    Self::Negative(d1 - d2)
                } else {
                    Self::Positive(d2 - d1)
                }
            }
            (Self::Positive(d1), Self::Negative(d2)) => {
                if let Ordering::Less = d1.cmp(&d2) {
                    Self::Negative(d2 - d1)
                } else {
                    Self::Positive(d1 - d2)
                }
            }
        }
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
        match offset {
            Offset::Negative(d) | Offset::Positive(d) => {
                if d > Duration::new(MAX_OFFSET, 0) {
                    return Err(TimePollError::OffsetTooLarge(format!(
                        "The offset provided exceeds the permitted limit. Maximum allowed offset (in seconds): {}.",
                        MAX_OFFSET
                    )));
                }
            }
        };
        // Update the clock offset
        self.set_offset_unchecked(offset);
        Ok(())
    }


    /// ### Time polling function
    ///
    /// A function that generates timestamps based on a time source taking the clock offset into
    /// consideration.
    fn poll_time(&self) -> Result<Timestamp, TimePollError> {
        let offset = self.get_offset();

        // Poll time from system.
        let now_duration = match Self::poll_duration() {
            Ok(value) => value,
            Err(error) => return Err(TimePollError::SystemTimeError(error.to_string())),
        };

        // Apply offset
        let shifted_duration = (Offset::Positive(now_duration) + offset).get_duration();

        // Generate timestamp
        match Timestamp::try_from(shifted_duration) {
            Ok(timestamp) => Ok(timestamp),
            Err(error) => Err(TimePollError::TimestampParseError(format!(
                "A timestamp could not be parsed from the given duration. {}",
                error
            ))),
        }
    }
}

//#region System time clock
/// ## System Time Clock
///
/// A clock relying on [`SysTime`] as time source.
#[derive(Clone, Copy, Default)]
pub struct SysTimeClock {
    offset: Offset
}

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
        match SystemTime::now().duration_since(UNIX_EPOCH) {
            Ok(value) => Ok(value),
            Err(error) => Err(TimePollError::SystemTimeError(format!(
                "A duration could not be derived from the system time. {}",
                error
            ))),
        }
    }
}
//#endregion

//#region Browser clock
/// ## Browser clock
///
/// A clock relying on browser APIs to poll time.
///
/// * The [`Performance` interface](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
///   is used to poll time. The time resolution is vendor-dependent, but is at-lest mil
#[derive(Clone, Copy, Default)]
pub struct BrowserClock {
    offset: Offset
}

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

#[wasm_bindgen]
pub fn test_clock() -> Result<u64, JsValue> {
    let clock = BrowserClock::default();
    match clock.poll_time() {
        Ok(timestamp) => Ok(timestamp.as_u64()),
        Err(error) => Err(JsValue::from(format!(
            "Error while trying to poll time. {}",
            error
        ))),
    }
}
//#endregion

//#region Server clock
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct ServerClock;

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
//#endregion

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sys_time_clock_works() {
        let mut clock = SysTimeClock::default();
        clock.poll_time().expect("System time polling without offset should work.");

        let neg_offset = Offset::Negative(Duration::new(1, 400));
        let pos_offset = Offset::Positive(Duration::new(1, 500));
        let too_large_duration = Duration::new(MAX_OFFSET + 1, 0);
        let neg_too_large = Offset::Negative(too_large_duration);
        let pos_too_large = Offset::Positive(too_large_duration);

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
