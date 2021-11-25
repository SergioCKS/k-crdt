//! # Unique ID
//!
//! Unique IDs used throughout the system.
//!
//! An ID consists of 128 uniformly random bits,
//! which is more than both NanoID (126 random bits) and UUIDv4 (122 random bits).
//!
//! An ID can be represented uniquely as a string of 21 characters over the
//! alphabet `A-Za-z0-9_-` plus a character over the alphabet `-012`
//! (22 characters total).
//!
//! Example ID in string form: `qI5wz90BL_9SXG79gaCcz1`
//!
//! ### Ordering
//!
//! In string format, the order is lexicographic and the order among characters is based on the
//! UTF-8 list of characters. This way, the ordering of the alphabet is : `-`, `0-9`, `A-Z`, `_`, `a-z`.
//!
//! In binary format (or equivalently as number), the derived (lexicographic)
//! ordering is consistent with the ordering in string format.
//!
//! ### Usage
//!
//! Create a new random UID and get its string representation.
//!
//! ```rust
//! use crdts::uid::{UID, ALPHABET};
//!
//! let uid = UID::new();
//! let uid_str = uid.to_string();
//!
//! assert_eq!(uid_str.chars().count(), 22, "A valid UID consists of 22 characters.");
//! assert!(uid_str.chars().all(|c| ALPHABET.contains(&c)), "All UID characters must be from the allowed alphabet.");
//! assert!(['-', '0', '1', '2'].contains(&uid_str.chars().last().unwrap()), "Last character must be '-', '0', '1' or '2'.")
//! ```
//!
//! Create a UID from a string representation.
//!
//! ```rust
//! use crdts::uid::UID;
//! use std::str::FromStr;
//!
//! let uid = UID::from_str("qI5wz90BL_9SXG79gaCcz1").unwrap();
//! ```
//!
use rand::random;
use serde::{Deserialize, Serialize};
use std::fmt::{Debug, Display, Formatter};
use std::str::FromStr;
use wasm_bindgen::prelude::*;


/// ## Alphabet
///
/// Ordered mapping of the allowed characters used in UIDs.
pub const ALPHABET: [char; 64] = [
    '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z',
];

/// ## Number to alphabet char
///
/// Returns the alphabet character corresponding to a given number.
///
/// * `n` - Integer in range 0-63.
/// * throws [`UIDParseError`] if `n` is out of bounds.
#[inline]
pub fn num_to_alphabet_char(n: u8) -> Result<char, UIDParseError> {
    if n > 63 {
        Err(UIDParseError::CharacterNotAllowed(format!(
            "The given number({}) does not correspond to a valid character in the alphabet. The allowed range is 0-63.",
            n
        )))
    } else {
        Ok(ALPHABET[n as usize])
    }
}

/// ## Alphabet char to number
///
/// Returns the number of a given character in the alphabet.
///
/// * `c` - Character in alphabet
/// * Throws [`UIDParseError`] if `c` is not in the alphabet.
#[inline]
fn alphabet_char_to_num(c: char) -> Result<u8, UIDParseError> {
    match ALPHABET.iter().position(|char| *char == c) {
        Some(value) => Ok(value as u8),
        None => Err(UIDParseError::CharacterNotAllowed(format!(
            "The character '{}' is not part of the allowed alphabet. The allowed alphabet is `A-Za-z0-9_-`.",
            c
        ))),
    }
}

/// ## UID
///
/// Unique ID represented compactly as [`u128`].
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize, Debug)]
pub struct UID(u128);

#[wasm_bindgen]
impl UID {
    /// ### Generate new ID
    ///
    /// Generates a new random unique ID.
    ///
    /// An ID can be represented as a string consisting of 21 random characters over the
    /// alphabet `A-Za-z0-9_-` followed by a random character over the alphabet `ABCD`
    /// (22 characters total).
    ///
    /// To generate random data, a `ThreadRNG` is used.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(random::<u128>())
    }

    #[wasm_bindgen(js_name = fromString)]
    pub fn from_string(nid_str: String) -> Result<UID, JsValue> {
        Ok(nid_str.parse::<Self>()?)
    }

    #[wasm_bindgen(js_name = toString)]
    pub fn as_string(&self) -> String {
        self.to_string()
    }

    pub fn as_byte_string(&self) -> Vec<u8> {
        vec![
            (self.0 >> 120) as u8,
            (self.0 >> 112) as u8,
            (self.0 >> 104) as u8,
            (self.0 >> 96) as u8,
            (self.0 >> 88) as u8,
            (self.0 >> 80) as u8,
            (self.0 >> 72) as u8,
            (self.0 >> 64) as u8,
            (self.0 >> 56) as u8,
            (self.0 >> 48) as u8,
            (self.0 >> 40) as u8,
            (self.0 >> 32) as u8,
            (self.0 >> 24) as u8,
            (self.0 >> 16) as u8,
            (self.0 >> 8) as u8,
            self.0 as u8
        ]
    }
}

//#region String representation
impl Display for UID {
    /// ### Format UID
    ///
    /// Computes the string representation of the UID.
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let six_bit_mask = 0b00111111usize;
        let uid_str: String = [
            ALPHABET[(self.0 >> 122) as usize],
            ALPHABET[((self.0 >> 116) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 110) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 104) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 98) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 92) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 86) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 80) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 74) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 68) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 62) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 56) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 50) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 44) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 38) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 32) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 26) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 20) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 14) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 8) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 2) as usize) & six_bit_mask],
            ALPHABET[((self.0 >> 110) as usize) & 0b00000011usize],
        ]
        .iter()
        .collect();
        write!(f, "{}", uid_str)
    }
}

impl FromStr for UID {
    type Err = UIDParseError;

    /// ### UID from string
    ///
    /// Create a UID instance from a string representation.
    ///
    /// * `s` - Valid string representation of UID.
    /// * Throws [`UIDParseError`] if `s` is not valid.
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        //#region Check number of characters.
        let num_chars = s.chars().count();
        if num_chars != 22 {
            return Err(UIDParseError::IncorrectLength(format!(
                "The number of characters ({}) is incorrect. A UID must have 22 characters.",
                num_chars
            )));
        }
        //#endregion

        //#region Check last character is valid.
        let last_char = s.chars().last().unwrap();
        if !['-', '0', '1', '2'].contains(&last_char) {
            return Err(
                UIDParseError::CharacterNotAllowed(format!(
                    "The last character is only allowed to be one of '-', '0', '1', '2'. Instead '{}' was given.",
                    last_char
                )));
        }
        //#endregion

        //#region Convert chars to numbers.
        let mut char_nums: [u8; 22] = [0; 22];
        for (position, c) in s.chars().enumerate() {
            char_nums[position] = match alphabet_char_to_num(c) {
                Ok(value) => value,
                Err(err) => return Err(err),
            };
        }
        //#endregion

        //#region Combine char numbers.
        Ok(UID(((char_nums[0] as u128) << 122)
            + ((char_nums[1] as u128) << 116)
            + ((char_nums[2] as u128) << 110)
            + ((char_nums[3] as u128) << 104)
            + ((char_nums[4] as u128) << 98)
            + ((char_nums[5] as u128) << 92)
            + ((char_nums[6] as u128) << 86)
            + ((char_nums[7] as u128) << 80)
            + ((char_nums[8] as u128) << 74)
            + ((char_nums[9] as u128) << 68)
            + ((char_nums[10] as u128) << 62)
            + ((char_nums[11] as u128) << 56)
            + ((char_nums[12] as u128) << 50)
            + ((char_nums[13] as u128) << 44)
            + ((char_nums[14] as u128) << 38)
            + ((char_nums[15] as u128) << 32)
            + ((char_nums[16] as u128) << 26)
            + ((char_nums[17] as u128) << 20)
            + ((char_nums[18] as u128) << 14)
            + ((char_nums[19] as u128) << 8)
            + ((char_nums[20] as u128) << 2)
            + (char_nums[21] as u128)))
        //#endregion
    }
}
//#endregion

//#region Parse UID error
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum UIDParseError {
    CharacterNotAllowed(String),
    IncorrectLength(String),
}

impl Display for UIDParseError {
    /// ### Display UID parse error
    ///
    /// Format the UID parse error for display.
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match *self {
            Self::CharacterNotAllowed(ref msg) | Self::IncorrectLength(ref msg) => {
                write!(f, "{}", msg)
            }
        }
    }
}

impl From<UIDParseError> for JsValue {
    fn from(err: UIDParseError) -> Self {
        JsValue::from(err.to_string())
    }
}
//#endregion

#[wasm_bindgen]
pub fn generate_id() -> String {
    UID::new().to_string()
}

#[cfg(test)]
mod uid_tests {
    use super::*;

    #[test]
    fn ordering_is_consistent() {
        let uid1 = UID::new();
        let uid2 = UID::new();
        assert_eq!(
            uid1.cmp(&uid2),
            uid1.to_string().cmp(&uid2.to_string()),
            "The ordering of random IDs should be the same regardless of format used."
        );
    }

    #[test]
    fn generates_correct_id() {
        let uid = UID::new();
        println!("Generated ID: {:?}. String representation: {}", uid, uid);

        assert_eq!(uid.to_string().len(), 22, "Generated ID should have the appropriate length.");
        assert!(
            uid.to_string().chars().all(|c| ALPHABET.contains(&c)),
            "The characters of the generated ID are from the allowed alphabet."
        );
        assert!(
            ['-', '0', '1', '2'].contains(&uid.to_string().chars().last().unwrap()),
            "The last character should be from the restricted alphabet."
        );
    }

    #[test]
    fn parses_from_string_correctly() {
        //#region Valid input.
        let correct_str = UID::new().to_string(); // Assumed correct from previous test.
        UID::from_str(&correct_str)
            .expect("It should be possible to build a UID from a valid string representation.");
        //#endregion

        //#region Invalid character.
        if let UIDParseError::CharacterNotAllowed(msg) =  UID::from_str("V1StGXR8_Z5jdH*6B-myT-")
            .expect_err("UID from string with invalid character should fail") {
            assert!(msg.contains("*"), "Error message should display the wrong character.");
        } else {
            panic!("Incorrect error type. Expected `UIDParseError::CharacterNotAllowed`.");
        }
        //#endregion

        //#region Short input.
        if let UIDParseError::IncorrectLength(msg) = UID::from_str("V1StGXR8_Z5jdHi60")
            .expect_err("UID from short input should fail.") {
            assert!(msg.contains("17"), "Error message should display the incorrect length.");
        } else {
            panic!("Incorrect error type. Expected `UIDParseError::IncorrectLength`.");
        }
        //#endregion

        //#region Long input.
        if let UIDParseError::IncorrectLength(msg) = UID::from_str("V1StGXR8_Z5jdHi6B-myTasdfasd0")
            .expect_err("UID from long input should fail.") {
            assert!(msg.contains("29"), "Error message should display the incorrect length.");
        } else {
            panic!("Incorrect error type. Expected `UIDParseError::IncorrectLength`.");
        }
        //#endregion

        //#region Fails if last character is invalid.
        if let UIDParseError::CharacterNotAllowed(msg) =  UID::from_str("V1StGXR8_Z5jdHi6B-myTA")
            .expect_err("UID from input with invalid last character should fail") {
            assert!(msg.contains("A"), "Error message should display the invalid character.");
        } else {
            panic!("Incorrect error type. Expected `UIDParseError::CharacterNotAllowed`.");
        }
        //#endregion
    }

    #[test]
    fn serializes_and_deserializes_correctly() {
        let uid = UID::new();
        let serialized: Vec<u8> = bincode::serialize(&uid)
            .expect("Serialization from new ID should work.");

        println!("UID: {:?}, Serialized: {:?}", uid, serialized);

        assert!(
            serialized.len() <= 16,
            "The serialized version of a UID shouldn't take more than 128 bits."
        );

        let deserialized: UID = bincode::deserialize(&serialized[..])
            .expect("Deserialization should work.");

        assert_eq!(
            uid, deserialized,
            "Serialization and deserialization of a UID shouldn't change its value"
        );
    }
}
