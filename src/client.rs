//! # Client interface
//!
//! Objects intended for usage in client-only environments.
use super::{
    time::Timestamp,
    lwwregister::{LWWRegister, RegisterMessage, BOOL_REG_SIZE},
    uid::UID
};
use wasm_bindgen::prelude::*;
use std::convert::TryInto;

/// ## Generate ID
///
/// Generates a unique ID in string format.
#[wasm_bindgen(js_name = generateId)]
pub fn generate_id() -> String {
    UID::new().to_string()
}

/// ## Create bool register
///
/// Constructs a last-write-wins register over a boolean value, serializes it and
/// returns the encoded version of the register.
///
/// * `ts` - Timestamp marking the moment of creation of the register.
/// * `value` - Initial value of the register.
/// * Throws a JS exception if the created register could not be serialized.
#[wasm_bindgen(js_name = createBoolRegister)]
pub fn create_bool_register(ts: Timestamp, value: bool) -> Vec<u8> {
    let register = LWWRegister::new(ts, value);
    bincode::serialize(&register).unwrap_throw()
}

/// ## Get bool register message
///
/// Constructs a message containing a bool register to be sent to a server node.
///
/// * `ts` - Timestamp marking the moment of emission of the message
/// * `id` - Unique ID of the register
/// * `encoded` - Encoded version of the register
/// * Throws a JS exception if:
///   * The the encoded register has the wrong number of bytes.
///   * The message could not be serialized.
#[wasm_bindgen(js_name = getBoolRegisterMessage)]
pub fn get_bool_register_message(ts: Timestamp, id: UID, encoded: Vec<u8>) -> Vec<u8> {
    let fixed: [u8; BOOL_REG_SIZE] = encoded.try_into().unwrap_throw();
    let message = RegisterMessage::new(ts, id, fixed);
    bincode::serialize(&message).unwrap_throw()
}