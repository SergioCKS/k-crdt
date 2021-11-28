//! # Clock
//!
//! An interface for clocks that poll time and output HLC/NTP timestamps.
use crate::time::timestamp::{Timestamp, FRACTIONS_MASK_U32, MS_TO_FRACTIONS};
use serde::{Deserialize, Serialize};
use std::fmt::{Debug, Display, Formatter};
use std::ops::Add;
use std::time::{Duration, SystemTimeError};
use wasm_bindgen::prelude::*;

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
    pub fn zero() -> Self {
        Self(0)
    }

    /// ### Create offset from milliseconds
    ///
    /// Constructs an [`Offset`] given the number of milliseconds (positive or negative).
    pub fn from_millis(offset_millis: i64) -> Self {
        Self(offset_millis)
    }

    /// ### As milliseconds
    ///
    /// Returns the offset as number of milliseconds (positive or negative).
    pub fn as_millis(&self) -> i64 {
        self.0
    }
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
    /// ### Time polling function
    ///
    /// A function that generates timestamps based on a time source taking the clock offset into
    /// consideration.
    fn poll_time(&self) -> Timestamp {
        let time_ms = self.poll_time_ms();
        let seconds = time_ms / 1_000f64;
        let fraction_ms = time_ms - (seconds.floor() * 1_000f64);
        let fractions = ((fraction_ms * MS_TO_FRACTIONS) as u32) & FRACTIONS_MASK_U32;
        Timestamp::new(seconds as u32, fractions, 0)
    }

    fn poll_time_ms(&self) -> f64;
}

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
        Self::SystemTimeError(format!(
            "Could not poll time from system. {}",
            sys_time_error.to_string()
        ))
    }
}
//#endregion

#[cfg(test)]
pub mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    //#region System time clock
    /// ## System Time Clock
    ///
    /// A clock relying on [`SysTime`] as time source.
    #[derive(Clone, Copy, Default)]
    pub struct SysTimeClock {
        offset: Offset, // bincode: 8 bytes
    }

    impl SysTimeClock {
        pub fn get_offset(&self) -> Offset {
            self.offset
        }

        pub fn set_offset(&mut self, offset: Offset) -> () {
            self.offset = offset;
        }
    }

    impl Clock for SysTimeClock {
        /// ### Poll time
        ///
        /// Polls the timesource using [`SysTime::now`].
        fn poll_time_ms(&self) -> f64 {
            let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
            let shifted = Duration::from(Offset::from(now) + self.offset);
            shifted.as_millis() as f64
        }
    }
    //#endregion

    #[test]
    fn sys_time_clock_works() {
        let mut clock = SysTimeClock::default();
        clock.poll_time();

        let neg_offset = Offset::from_millis(-400_000);
        let pos_offset = Offset::from_millis(400_000);
        let neg_too_large = Offset::from_millis(-(MAX_OFFSET + 1));
        let pos_too_large = Offset::from_millis(MAX_OFFSET + 1);

        clock.set_offset(neg_offset);
        clock.poll_time();

        clock.set_offset(pos_offset);
        clock.poll_time();

        // for offset in vec![neg_too_large, pos_too_large] {
        //     if let TimePollError::OffsetTooLarge(msg) = clock
        //         .set_offset(offset)
        //     {
        //         assert!(
        //             msg.contains(&MAX_OFFSET.to_string()),
        //             "Error message should indicate offset limit."
        //         );
        //     } else {
        //         panic!("Incorrect error type: Expected `TimePollError:OffsetTooLarge`.")
        //     }
        // }
    }
}
