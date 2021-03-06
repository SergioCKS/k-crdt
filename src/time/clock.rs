//! # Clock
//!
//! An interface for clocks that poll time and output HLC/NTP timestamps.
use crate::{
    serialization::{Deserialize, Serialize},
    time::timestamp::Timestamp,
};
use std::{
    ops::Add,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

//#region Constants
/// ## Maximum time offset
///
/// Maximum time offset (in seconds) for shifting time measurements.
pub const MAX_OFFSET: i64 = 31_556_952;
pub const OFFSET_SIZE: usize = 8;
//#endregion

//#region Offset
/// ## Offset
///
/// Time offset in milliseconds.
#[derive(Clone, Copy, Default, Debug, Eq, PartialEq)]
pub struct Offset(i64); // encoded: 8 bytes

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

//#region Addition
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

//#region Serialization
impl Serialize<OFFSET_SIZE> for Offset {
    fn serialize(&self) -> [u8; OFFSET_SIZE] {
        self.0.to_be_bytes()
    }
}

impl Deserialize<OFFSET_SIZE> for Offset {
    fn deserialize(encoded: [u8; OFFSET_SIZE]) -> Self {
        Offset(i64::from_be_bytes(encoded.into()))
    }
}
//#endregion
//#endregion

/// ## Clock (trait)
///
/// A clock is capable of polling a time source and generating an HLC/NTP timestamp.
pub trait Clock: Default {
    /// ### Time polling function
    ///
    /// A function that generates timestamps based on a time source taking the clock offset into
    /// consideration.
    fn poll_time(&self) -> Timestamp {
        Timestamp::from_ms(self.poll_time_ms())
    }

    /// ### Poll time in milliseconds
    ///
    /// Polls the local time source in milliseconds since epoch (possibly with a fraction part).
    /// Time polling should be reliable, no errors are expected.
    fn poll_time_ms(&self) -> f64;
}

/// ## Offsetted (trait)
///
/// A clock that maintains an offset that is applied to times polled from the local source.
pub trait Offsetted: Clock {
    /// ### Get offset
    ///
    /// Retrieves the current offset of the clock.
    fn get_offset(&self) -> Offset;

    /// ### Set offset (unchecked)
    ///
    /// Directly updates the offset of the clock without checking the allowed limit.
    fn set_offset_unchecked(&mut self, offset: Offset) -> ();

    /// ### Set offset
    ///
    /// Updates the offset of the clock.
    /// If the limit is exceeded, the limit is used instead (saturating behaviour).
    fn set_offset(&mut self, offset: Offset) -> () {
        let offset = if offset.as_millis().abs() > MAX_OFFSET {
            Offset::from_millis(offset.as_millis().signum() * MAX_OFFSET)
        } else {
            offset
        };
        self.set_offset_unchecked(offset);
    }
}

//#region System time clock
/// ## System Time Clock
///
/// A clock relying on [`SysTime`] as time source.
#[derive(Clone, Copy, Default)]
pub struct SysTimeClock {
    offset: Offset, // bincode: 8 bytes
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

impl Offsetted for SysTimeClock {
    fn get_offset(&self) -> Offset {
        self.offset
    }

    fn set_offset_unchecked(&mut self, offset: Offset) -> () {
        self.offset = offset;
    }
}
//#endregion

//#region Generic tests
/// ## Test clock
///
/// Performs generic tests for a clock type.
pub fn test_clock<T: Clock>() {
    let clock = T::default();
    clock.poll_time();
}

/// ## Test offsetted
///
/// Performs generic tests for an offsetted clock type.
pub fn test_offsetted<T: Offsetted>() {
    // Default clock
    let mut clock = T::default();

    //#region Getter/Setters work as expected
    let neg_offset = Offset::from_millis(-400_000);
    let pos_offset = Offset::from_millis(400_000);
    let neg_too_large = Offset::from_millis(-(MAX_OFFSET + 1));
    let pos_too_large = Offset::from_millis(MAX_OFFSET + 1);

    for (offset, ms) in [
        (neg_offset, -400_000i64),
        (pos_offset, 400_000i64),
        (neg_too_large, -MAX_OFFSET),
        (pos_too_large, MAX_OFFSET),
    ] {
        clock.set_offset(offset);
        assert_eq!(
            clock.get_offset().as_millis(),
            ms,
            "Wrong value after setting and retrieving offset."
        );
        clock.poll_time();
    }
    //#endregion

    //#region Offset changes polled time.
    let mut clock2 = T::default();
    clock.set_offset(Offset::from_millis(0));
    clock2.set_offset(Offset::from_millis(900));
    let ts1 = clock.poll_time();
    let ts2 = clock2.poll_time();
    assert!(ts2.get_duration() - ts1.get_duration() >= Duration::from_millis(895));
    clock2.set_offset(Offset::from_millis(-900));
    let ts1 = clock.poll_time();
    let ts2 = clock2.poll_time();
    assert!(ts1.get_duration() - ts2.get_duration() >= Duration::from_millis(895));
    //#endregion
}
//#endregion

#[cfg(test)]
mod tests {
    use super::*;
    use crate::serialization::test_serialization;

    #[test]
    fn offset_works() {
        // Offset from duration
        Offset::from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap());
    }

    #[test]
    fn offset_serialization_deserialization_works() {
        test_serialization::<Offset, OFFSET_SIZE>();
    }

    #[test]
    fn sys_time_clock_works() {
        test_clock::<SysTimeClock>();
        test_offsetted::<SysTimeClock>();
    }
}
