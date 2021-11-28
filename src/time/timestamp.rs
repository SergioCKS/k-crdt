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
use humantime::parse_rfc3339;
use serde::{Deserialize, Serialize};
use std::fmt::{Debug, Display, Formatter};
use std::ops::{Add, Sub};
use std::str::FromStr;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use wasm_bindgen::prelude::*;

//#region Constants
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
/// Factor for converting nanoseconds to second fractions.
/// Each nanosecond corresponds to about 4.295 second fractions.
/// Useful for transforming durations to timestamps.
pub const NS_TO_FRACTIONS: f64 = ((1u64 << 32) as f64) / 1_000_000_000f64; // About 4.295

/// ## Millisecond to fraction factor
///
/// Factor for converting milliseconds to second fractions.
/// Each millisecond equals about 4294967.296 fractions.
pub const MS_TO_FRACTIONS: f64 = ((1u64 << 32) as f64) / 1_000f64; //  4294967.296

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
impl From<Duration> for Timestamp {
    fn from(duration: Duration) -> Self {
        let seconds = duration.as_secs();
        let seconds = if seconds > u32::MAX as u64 {
            u32::MAX as u64
        } else {
            seconds
        };
        let fractions = ((duration.subsec_nanos() as f64) * NS_TO_FRACTIONS) as u64;
        let fractions_part = fractions & FRACTIONS_MASK; // Introduces loss of resolution.
        let counter_part = fractions & COUNTER_MASK;
        let carry = if counter_part == 0 { 0u64 } else { 1u64 << 8 };
        Self((seconds << 32) + fractions_part + carry)
    }
}

impl From<SystemTime> for Timestamp {
    fn from(sys_time: SystemTime) -> Self {
        Self::from(sys_time.duration_since(UNIX_EPOCH).unwrap())
    }
}

impl FromStr for Timestamp {
    type Err = TimestampError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match parse_rfc3339(s) {
            Ok(sys_time) => Ok(Timestamp::from(sys_time)),
            Err(_) => Err(TimestampError::RFCParseError),
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

impl Add<Timestamp> for Timestamp {
    type Output = Self;
    fn add(self, rhs: Timestamp) -> Self::Output {
        Self(self.0 + rhs.0)
    }
}

impl Sub<Timestamp> for Timestamp {
    type Output = Self;
    fn sub(self, rhs: Timestamp) -> Self::Output {
        Self(self.0 - rhs.0)
    }
}

//#region TimestampError
/// ## Timestamp error
///
/// Custom error related to timestamps methods.
#[derive(Debug)]
pub enum TimestampError {
    RFCParseError,
}
//#endregion

#[cfg(test)]
mod tests {
    use super::*;
    use humantime::format_rfc3339;
    use std::cmp::Ordering;

    #[test]
    fn getters_work() {
        //#region Anchor values
        let now_duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        let now_secs = now_duration.as_secs();
        let now_subsec_nanos = now_duration.subsec_nanos();
        //#endregion

        //#region Timestamp objects
        let ts = Timestamp::from(now_duration);

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
    fn saturating_on_seconds_limit_exceeded() {
        // When the seconds limit is exceeded, a saturating behaviour is expected.
        let secs_too_large = Timestamp::from(Duration::new(u32::MAX as u64 + 1, 0));
        let secs_on_limit = Timestamp::from(Duration::new(u32::MAX as u64, 0));
        assert_eq!(secs_too_large, secs_on_limit);
    }

    #[test]
    fn from_system_time_works() {
        let sys_time = SystemTime::now();
        let duration = sys_time.duration_since(UNIX_EPOCH).unwrap();
        assert_eq!(Timestamp::from(sys_time), Timestamp::from(duration));
    }

    #[test]
    #[should_panic]
    fn system_time_before_unix_epoch_fails() {
        let mut sys_time = SystemTime::now();
        let duration = sys_time.duration_since(UNIX_EPOCH).unwrap() + Duration::new(1, 0);
        sys_time -= duration;
        Timestamp::from(sys_time);
    }

    #[test]
    fn from_str_works() {
        if let Err(TimestampError::RFCParseError) = Timestamp::from_str("a") {
        } else {
            panic!(
                "Timestamp from invalid string should fail with `TimestampError::RFCParseError`"
            );
        }

        let timestamp = format_rfc3339(SystemTime::now()).to_string();
        Timestamp::from_str(&timestamp)
            .expect("Should work with input formatted from `SystemTime::now()`.");
    }

    #[test]
    fn addition_works() {
        let duration_a = Duration::new(2, 3);
        let duration_b = Duration::new(3, 2);
        let duration_120_nanos = Duration::new(0, 120);
        let duration_sum = duration_a + duration_b;

        let ts_a = Timestamp::from(duration_a);
        let ts_b = Timestamp::from(duration_b);

        let ts_sum = ts_a + ts_b;

        assert!(ts_sum.get_duration() - duration_sum < duration_120_nanos);
    }

    #[test]
    fn subtraction_works() {
        let duration_a = Duration::new(5, 500);
        let duration_b = Duration::new(3, 2);
        let duration_60_nanos = Duration::new(0, 60);
        let duration_diff = duration_a - duration_b;

        let ts_a = Timestamp::from(duration_a);
        let ts_b = Timestamp::from(duration_b);

        let ts_diff = ts_a - ts_b;
        let ts_diff_duration = ts_diff.get_duration();

        let distance = match ts_diff_duration.cmp(&duration_diff) {
            Ordering::Less => duration_diff - ts_diff_duration,
            _ => ts_diff_duration - duration_diff,
        };

        assert!(distance < duration_60_nanos);
    }

    #[test]
    fn comparison_works() {
        let ts1 = Timestamp::from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap());
        let ts2 = Timestamp::from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap());
        assert!(ts1 <= ts2, "Comparison of timestamps should work.");
    }

    #[test]
    fn serialization_deserialization_works() {
        let timestamp = Timestamp::from(SystemTime::now().duration_since(UNIX_EPOCH).unwrap());
        let encoded: Vec<u8> =
            bincode::serialize(&timestamp).expect("Timestamp should be serializable.");
        assert!(
            encoded.len() == 8,
            "Encoding of a timestamp should be exactly 8 bytes."
        );
        let decoded: Timestamp =
            bincode::deserialize(&encoded[..]).expect("Deserialization should work.");
        assert_eq!(
            timestamp, decoded,
            "Encoding and decoding a timestamp should not change the value of a timestamp."
        );
    }
}
