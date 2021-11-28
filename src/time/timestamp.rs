//! # HLC Timestamp
//!
//! Implementation of 64-bit HLC timestamps.
//! An HLC timestamp is a 64-bit NTP timestamp in which the last 8 bits are used as a counter.
//!
//! > The 64-bit timestamps used by NTP consist of a 32-bit part for seconds and a 32-bit part for
//!   fractional second, giving a time scale that rolls over every 232 seconds (136 years) and a
//!   theoretical resolution of 2^−32 seconds (233 picoseconds). -
//!   [Wikipedia - NTP Timestamps](https://en.wikipedia.org/wiki/Network_Time_Protocol#Timestamps)
//!
//! The timestamp scheme utilized is the one proposed in
//! [Kulkarni et. al. - Section 6.2](https://cse.buffalo.edu/tech-reports/2014-04.pdf), with the
//! exception that only 8 bits are used for the counter part as opposed to the 16 bits proposed
//! in the paper.
//!
//! ### Timestamp structure
//!
//! ```text
//! NTP ts.: |------Seconds (32-bits)-------||--Second fractions (32-bits)--|
//! HLC ts.: |------Seconds (32-bits)-------||--Second fractions 24-||-Ct 8-|
//! ```
//!
//! * **Seconds (32 bits)**: Number of seconds since epoch.
//! * **Second fractions (24 bits)**: Number of fractions of a second rounded up to the
//!   most significant 24 bits. Each fraction corresponds to 1/(2^32) seconds.
//! * **Counter (8 bits):** Logical clock part of HLCs.
//!
//! #### Technical details
//!  
//! **Epoch.** The epoch used by the timestamps is not part of the data structure,
//! so it must be taken from context in order to derive a point in time from a timestamp.
//! When transforming to and from [`SystemTime`], a [`UNIX_EPOCH`] is assumed.
//!
//! **Fractional seconds in HLC timestamps.** Since only 24 bits are used in HLC timestamps to
//! store the number of second fractions, the least significant 8 bits of the fractional second
//! part are ignored and the most significant 24 bits are rounded up. The time resolution achieved
//! by this scheme is of about 60 nanoseconds. This keeps HLC timestamps backwards compatible with
//! NTP timestamps, as long as the loss of resolution is acceptable.
//!
//! **Order.** Since order is derived from `u64`, timestamps are ordered lexicographically with the
//! time part taking precedence over the counter part. Usually, timestamps are associated with a
//! the node in the system that generated it by providing the node ID. In case of a tie, the node ID
//! would be used to pick the winner arbitrarily but deterministically.
use crate::time::clock::TimePollError;
use humantime::parse_rfc3339;
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use std::fmt::{Debug, Display, Formatter};
use std::ops::{Add, AddAssign, Sub};
use std::str::FromStr;
use std::time::{Duration, SystemTime, SystemTimeError, UNIX_EPOCH};
use wasm_bindgen::prelude::*;

//#region Constants
/// ## Maximum number of seconds for duration
///
/// Maximum number of seconds of a [`Duration`] when converting to a [`Timestamp`].
pub const DURATION_MAX_SECONDS: u64 = (1 << 32) - 1;

/// ## Fraction to nanosecond factor
///
/// Factor for converting second fractions to nanoseconds.
/// Useful for transforming timestamps to durations.
///
/// A second fraction is less than a quarter of a nanosecond (~0.23 ns), this way,
/// converting fractions to nanoseconds and casting the result from a float to an integer,
/// there can be a loss of accuracy of up to 4 ns.
pub const FRACTIONS_TO_NS: f64 = 1_000_000_000f64 / ((1u64 << 32) as f64);

/// ## Nanosecond to fraction factor
///
/// Factor for converting nanoseconds to fractions.
/// Useful for transforming durations to timestamps.
pub const NS_TO_FRACTIONS: f64 = ((1u64 << 32) as f64) / 1_000_000_000f64;

/// ## Millisecond to fraction factor
///
/// Factor for converting milliseconds to fractions.
pub const MS_TO_FRACTIONS: f64 = ((1u64 << 32) as f64) / 1_000f64;

/// ## Time part mask
///
/// 64-bit mask that selects the time part of the timestamp.
/// The time part includes the seconds and second fractions parts.
///
/// ### Structure
/// ```text
/// 1111111111111111111111111111111111111111111111111111111100000000
/// |----------------------- 56 bits ----------------------||8 bits|
pub const TIME_MASK: u64 =
    0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_00000000;

/// ## Seconds part mask
///
/// 64-bit mask that selects the seconds part of the timestamp.
///
/// ### Structure
/// ```text
/// 1111111111111111111111111111111100000000000000000000000000000000
/// |----------- 32 bits ----------||----------- 32 bits ----------|
/// ```
pub const SECONDS_MASK: u64 =
    0b11111111_11111111_11111111_11111111_00000000_00000000_00000000_00000000;

/// ## Fractions part mask
///
/// 64-bit mask that selects the second fractions part of the timestamp.
///
/// ### Structure
/// ```text
/// 0000000000000000000000000000000011111111111111111111111100000000
/// |----------- 32 bits ----------||------- 24 bits ------||8 bits|
/// ```
pub const FRACTIONS_MASK: u64 =
    0b00000000_00000000_00000000_00000000_11111111_11111111_11111111_00000000;

/// ## Fractions part mask (u32)
///
/// 32-bit mask that selects the second fractions part of the timestamp.
///
/// ### Structure
/// ```text
/// 11111111111111111111111100000000
/// |------- 24 bits ------||8 bits|
/// ```
pub const FRACTIONS_MASK_U32: u32 = 0b11111111_11111111_11111111_00000000;

/// ## Counter part mask
///
/// 64-bit mask that selects the counter part of the timestamp.
///
/// ### Structure
/// ```text
/// 0000000000000000000000000000000000000000000000000000000011111111
/// |----------------------- 56 bits ----------------------||8 bits|
/// ```
pub const COUNTER_MASK: u64 =
    0b00000000_00000000_00000000_00000000_00000000_00000000_00000000_11111111;
//#endregion

/// ## HLC Timestamp
///
/// 64-bit HLC/NTP timestamp.
#[wasm_bindgen]
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Default, Debug, Serialize, Deserialize)]
pub struct Timestamp(u64); // bincode: 8 bytes

#[wasm_bindgen]
impl Timestamp {
    /// ### To String
    ///
    /// Returns a string representation of the timestamp.
    #[wasm_bindgen(js_name = toString)]
    pub fn as_string(&self) -> String {
        self.to_string()
    }
}

impl Timestamp {
    #[inline]
    pub fn new(seconds: u32, fractions: u32, count: u8) -> Self {
        Self(((seconds as u64) << 32) + ((fractions as u64) & FRACTIONS_MASK) + count as u64)
    }

    /// ### As `u64`
    ///
    /// Returns the timestamp as a 64-bit unsigned integer.
    #[inline]
    pub fn as_u64(&self) -> u64 {
        self.0
    }

    /// ### Get time part
    ///
    /// Returns the time part of the timestamp.
    #[inline]
    pub fn get_time(&self) -> u64 {
        self.0 & TIME_MASK
    }

    /// ### Get seconds
    ///
    /// Returns the seconds part of the timestamp (leading 32 bits).
    #[inline]
    pub fn get_seconds(&self) -> u32 {
        (self.0 >> 32) as u32
    }

    /// ### Get second fractions
    ///
    /// Returns the second fractions part of the timestamp.
    #[inline]
    pub fn get_fractions(&self) -> u32 {
        (self.0 & FRACTIONS_MASK) as u32
    }

    /// ### Get counter part
    ///
    /// Returns the counter part of the timestamp.
    #[inline]
    pub fn get_count(&self) -> u8 {
        self.0 as u8
    }

    /// ### Get nanoseconds
    ///
    /// Returns the second fractions part as nanoseconds.
    #[inline]
    pub fn get_nanoseconds(&self) -> u32 {
        (self.get_fractions() as f64 * FRACTIONS_TO_NS) as u32
    }

    /// ### Increase counter
    ///
    /// Increases the counter part of the timestamp by 1.
    #[inline]
    pub fn increase_counter(&mut self) {
        self.0 += 1;
    }

    /// ### To duration
    ///
    /// Converts the timestamp to a [`Duration`].
    #[inline]
    pub fn get_duration(&self) -> Duration {
        Duration::new(self.get_seconds().into(), self.get_nanoseconds())
    }
}

//#region Construction from other types
impl TryFrom<Duration> for Timestamp {
    type Error = TimestampError;

    fn try_from(duration: Duration) -> Result<Self, Self::Error> {
        let seconds = duration.as_secs();
        let nanoseconds = duration.subsec_nanos();

        if seconds > DURATION_MAX_SECONDS {
            // Number of seconds cannot be encoded with only 32 bits.
            Err(TimestampError::DurationTooLarge(format!(
                "The number of seconds in the given duration ({}) is too large to fit in a timestamp. Maximum number of seconds allowed: {}.",
                seconds,
                DURATION_MAX_SECONDS
            )))
        } else {
            let seconds_part = seconds << 32;
            let fractions = (nanoseconds as f64 * NS_TO_FRACTIONS) as u64;
            let fraction_part = fractions & FRACTIONS_MASK; // Introduces loss of resolution.
            let counter_part = fractions & COUNTER_MASK;
            let carry = if counter_part == 0 { 0u64 } else { 1u64 << 8 };
            Ok(Self(seconds_part + (fraction_part + carry)))
        }
    }
}

impl TryFrom<SystemTime> for Timestamp {
    type Error = TimestampError;

    fn try_from(sys_time: SystemTime) -> Result<Self, Self::Error> {
        Self::try_from(sys_time.duration_since(UNIX_EPOCH)?)
    }
}

impl FromStr for Timestamp {
    type Err = TimestampError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match parse_rfc3339(s) {
            Ok(sys_time) => Timestamp::try_from(sys_time),
            Err(error) => Err(TimestampError::RFCParseError(format!(
                "A timestamp could not be parsed from the given string. {}",
                error
            ))),
        }
    }
}
//#endregion

impl Display for Timestamp {
    /// ### Display NTP timestamp
    ///
    /// Format the NTP timestamp for display.
    /// Shows the timestamp as an RFC3339 timestamp that includes nanoseconds, even if they are zero.
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        write!(
            f,
            "Seconds: {}, Fractions: {}, Counter: {}",
            self.get_seconds(),
            self.get_fractions(),
            self.get_count()
        )
    }
}

//#region Addition trait implementations
impl Add for Timestamp {
    type Output = Self;

    #[inline]
    fn add(self, other: Self) -> Self {
        Self(self.0 + other.0)
    }
}

impl<'a> Add<Timestamp> for &'a Timestamp {
    type Output = <Timestamp as Add<Timestamp>>::Output;

    #[inline]
    fn add(self, other: Timestamp) -> <Timestamp as Add<Timestamp>>::Output {
        Add::add(*self, other)
    }
}

impl Add<&Timestamp> for Timestamp {
    type Output = <Timestamp as Add<Timestamp>>::Output;

    #[inline]
    fn add(self, other: &Timestamp) -> <Timestamp as Add<Timestamp>>::Output {
        Add::add(self, *other)
    }
}

impl Add<&Timestamp> for &Timestamp {
    type Output = <Timestamp as Add<Timestamp>>::Output;

    #[inline]
    fn add(self, other: &Timestamp) -> <Timestamp as Add<Timestamp>>::Output {
        Add::add(*self, *other)
    }
}

impl Add<u64> for Timestamp {
    type Output = Self;

    #[inline]
    fn add(self, other: u64) -> Self {
        Self(self.0 + other)
    }
}

impl AddAssign<u64> for Timestamp {
    #[inline]
    fn add_assign(&mut self, other: u64) {
        *self = Self(self.0 + other);
    }
}
//#endregion

//#region Subtraction trait implementations
impl Sub for Timestamp {
    type Output = Self;

    #[inline]
    fn sub(self, other: Self) -> Self {
        Self(self.0 - other.0)
    }
}

impl<'a> Sub<Timestamp> for &'a Timestamp {
    type Output = <Timestamp as Sub<Timestamp>>::Output;

    #[inline]
    fn sub(self, other: Timestamp) -> <Timestamp as Sub<Timestamp>>::Output {
        Sub::sub(*self, other)
    }
}

impl Sub<&Timestamp> for Timestamp {
    type Output = <Timestamp as Sub<Timestamp>>::Output;

    #[inline]
    fn sub(self, other: &Timestamp) -> <Timestamp as Sub<Timestamp>>::Output {
        Sub::sub(self, *other)
    }
}

impl Sub<&Timestamp> for &Timestamp {
    type Output = <Timestamp as Sub<Timestamp>>::Output;

    #[inline]
    fn sub(self, other: &Timestamp) -> <Timestamp as Sub<Timestamp>>::Output {
        Sub::sub(*self, *other)
    }
}

impl Sub<u64> for Timestamp {
    type Output = Self;

    #[inline]
    fn sub(self, other: u64) -> Self {
        Self(self.0 - other)
    }
}
//#endregion

//#region TimestampError
/// ## Timestamp error
///
/// Custom error related to timestamps methods.
#[derive(Debug)]
pub enum TimestampError {
    DurationTooLarge(String),
    SystemTimeError(String),
    RFCParseError(String),
}

impl Display for TimestampError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match *self {
            Self::DurationTooLarge(ref msg)
            | Self::SystemTimeError(ref msg)
            | Self::RFCParseError(ref msg) => write!(f, "{}", msg),
        }
    }
}

impl From<SystemTimeError> for TimestampError {
    fn from(error: SystemTimeError) -> Self {
        TimestampError::SystemTimeError(format!(
            "A duration since UNIX epoch could not be derived from the given system time. {}",
            error
        ))
    }
}

impl From<TimestampError> for TimePollError {
    fn from(ts_error: TimestampError) -> Self {
        TimePollError::TimestampParseError(ts_error.to_string())
    }
}
//#endregion

#[cfg(test)]
mod tests {
    use super::*;
    use humantime::format_rfc3339;
    use std::cmp::Ordering;

    fn distance(duration1: Duration, duration2: Duration) -> Duration {
        match duration1.cmp(&duration2) {
            Ordering::Less => duration2 - duration1,
            _ => duration1 - duration2,
        }
    }

    #[test]
    fn getters_work() {
        //#region Anchor values
        let now_duration = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Duration from unmodified SystemTime::now() should work.");
        let now_secs = now_duration.as_secs();
        let now_subsec_nanos = now_duration.subsec_nanos();
        //#endregion

        //#region Timestamp objects
        let ts = Timestamp::try_from(now_duration).expect(
            "Timestamps from unmodified SystemTime::now() duration since UNIX epoch should work.",
        );

        let ts_u64 = ts.as_u64();
        let ts_time = ts.get_time();
        let ts_seconds = ts.get_seconds();
        let ts_fractions = ts.get_fractions();
        let ts_counter = ts.get_count();
        let ts_nanoseconds = ts.get_nanoseconds();
        let ts_duration = ts.get_duration();
        //#endregion

        //#region Tests
        // Getters are consistent with internal representation.
        assert_eq!(
            ts_time,
            ts_u64 & TIME_MASK,
            "Time getter should return the most significant 58 bits."
        );
        assert_eq!(
            ts_seconds,
            ((ts_u64 & SECONDS_MASK) >> 32) as u32,
            "Seconds getter should return the most significant 32 bits."
        );
        assert_eq!(
            ts_fractions,
            (ts_u64 & FRACTIONS_MASK) as u32,
            "Fractions getter should return bits 33 to 58."
        );
        assert_eq!(
            ts_counter,
            (ts_u64 & COUNTER_MASK) as u8,
            "Counter getter should return the least significant 8 bits."
        );

        // Values of getters are correct.
        assert_eq!(
            ts_seconds as u64, now_secs,
            "Seconds getter should return the same number of seconds as the original."
        );
        // Second fractions are rounded up, so nanoseconds should always be at least as large as original.
        assert!(
            ts_nanoseconds >= now_subsec_nanos,
            "Nanosecond getter should return at least as many nanoseconds as the original."
        );
        assert!(
            ts_nanoseconds - now_subsec_nanos < 60,
            "Timestamp resolution should be smaller than 60 nanoseconds."
        );
        // Same should hold in duration format.
        assert!(
            ts_duration > now_duration,
            "Duration getter should be at least as large as the original."
        );
        assert!(
            ts_duration - now_duration < Duration::new(0, 60),
            "Timestamp resolution should be smaller than 60 nanoseconds."
        );
        //#endregion
    }

    #[test]
    fn from_duration_works() {
        let error = Timestamp::try_from(Duration::new(DURATION_MAX_SECONDS + 1, 0))
            .expect_err("Should fail if second limit is exceeded");

        if let TimestampError::DurationTooLarge(msg) = error {
            assert!(
                msg.contains(&DURATION_MAX_SECONDS.to_string()),
                "Error should indicate the maximum duration allowed in seconds."
            );
            assert!(
                msg.contains(&(DURATION_MAX_SECONDS + 1).to_string()),
                "Error should indicate the given duration in seconds."
            );
        } else {
            panic!("Incorrect error type: Expected `TimestampError::DurationTooLarge`.");
        }

        Timestamp::try_from(Duration::new((1u64 << 32) - 1, 0))
            .expect("Should work on the edge of second limit");

        Timestamp::try_from(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Duration from unmodified SystemTime::now() should work."),
        )
        .expect("Timestamp from `SystemTime::now()` duration since UNIX Epoch should work.");
    }

    #[test]
    fn from_system_time_works() {
        let mut now = SystemTime::now();
        Timestamp::try_from(now).expect("Timestamp from unmodified SystemTime::now() should work.");

        let now_duration = now
            .duration_since(UNIX_EPOCH)
            .expect("Duration from unmodified SystemTime::now() should work.");

        now -= now_duration + Duration::new(1, 0);

        let err = Timestamp::try_from(now)
            .expect_err("Timestamp from system time earlier than UNIX_EPOCH should fail.");

        if let TimestampError::SystemTimeError(msg) = err {
            assert!(
                msg.contains("UNIX"),
                "Error message should suggest problems related to UNIX epoch."
            );
        } else {
            panic!("Incorrect error type: Expected `TimestampError::SystemTimeError`.");
        }
    }

    #[test]
    fn from_str_works() {
        Timestamp::from_str("a").expect_err("Should fail with invalid input.");

        let timestamp = format_rfc3339(SystemTime::now()).to_string();
        Timestamp::from_str(&timestamp)
            .expect("Should work with input formatted from `SystemTime::now()`.");
    }

    #[test]
    fn addition_works() {
        let duration_a = Duration::new(2, 3);
        let duration_b = Duration::new(3, 2);
        let duration_60_nanos = Duration::new(0, 60);
        let duration_120_nanos = Duration::new(0, 120);
        let duration_sum = duration_a + duration_b;

        let mut ts_a = Timestamp::try_from(duration_a).unwrap();
        let ts_b = Timestamp::try_from(duration_b).unwrap();
        assert!(ts_a.get_duration() - duration_a < duration_60_nanos);
        assert!(ts_b.get_duration() - duration_b < duration_60_nanos);

        //#region Should allow addition from different types
        let ts_sum_1 = ts_a + ts_b;
        let ts_sum_2 = &ts_a + ts_b;
        let ts_sum_3 = ts_a + &ts_b;
        let ts_sum_4 = &ts_a + &ts_b;
        let ts_sum_5 = ts_a + ts_b.as_u64();
        ts_a += ts_b.as_u64();
        //#endregion

        //#region Results should be correct
        assert!(ts_sum_1.get_duration() - duration_sum < duration_120_nanos);
        assert!(ts_sum_2.get_duration() - duration_sum < duration_120_nanos);
        assert!(ts_sum_3.get_duration() - duration_sum < duration_120_nanos);
        assert!(ts_sum_4.get_duration() - duration_sum < duration_120_nanos);
        assert!(ts_sum_5.get_duration() - duration_sum < duration_120_nanos);
        assert!(ts_a.get_duration() - duration_sum < duration_120_nanos);
        //#endregion
    }

    #[test]
    fn subtraction_works() {
        //#region Setup
        let duration_a = Duration::new(5, 500);
        let duration_b = Duration::new(3, 2);
        let duration_60_nanos = Duration::new(0, 60);
        let duration_diff = duration_a - duration_b;

        let ntp_a = Timestamp::try_from(duration_a).unwrap();
        let ntp_b = Timestamp::try_from(duration_b).unwrap();
        assert!(ntp_a.get_duration() - duration_a < duration_60_nanos);
        assert!(ntp_b.get_duration() - duration_b < duration_60_nanos);
        //#endregion

        //#region Should allow subtraction from different types
        let ntp_diff_1 = ntp_a - ntp_b;
        let ntp_diff_2 = &ntp_a - ntp_b;
        let ntp_diff_3 = ntp_a - &ntp_b;
        let ntp_diff_4 = &ntp_a - &ntp_b;
        let ntp_diff_5 = ntp_a - ntp_b.as_u64();
        //#endregion

        //#region Results should be correct
        assert!(distance(ntp_diff_1.get_duration(), duration_diff) < duration_60_nanos);
        assert!(distance(ntp_diff_2.get_duration(), duration_diff) < duration_60_nanos);
        assert!(distance(ntp_diff_3.get_duration(), duration_diff) < duration_60_nanos);
        assert!(distance(ntp_diff_4.get_duration(), duration_diff) < duration_60_nanos);
        assert!(distance(ntp_diff_5.get_duration(), duration_diff) < duration_60_nanos);
        //#endregion
    }

    #[test]
    fn comparison_works() {
        let ts1 =
            Timestamp::try_from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap()).unwrap();
        let ts2 =
            Timestamp::try_from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap()).unwrap();
        assert!(ts1 <= ts2, "Comparison of timestamps should work.");
    }

    #[test]
    fn serialization_deserialization_works() {
        let timestamp =
            Timestamp::try_from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap()).unwrap();
        let encoded: Vec<u8> =
            bincode::serialize(&timestamp).expect("Timestamp should be serializable.");
        assert!(
            encoded.len() <= 8,
            "Encoding of a timestamp should be at most 64 bits."
        );
        let decoded: Timestamp =
            bincode::deserialize(&encoded[..]).expect("Deserialization should work.");
        assert_eq!(
            timestamp, decoded,
            "Encoding and decoding a timestamp should not change the value of a timestamp."
        );
    }
}
