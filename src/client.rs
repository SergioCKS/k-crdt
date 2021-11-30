//! # Client interface
//!
//! Objects intended for usage in client-only environments.
use super::{lwwregister::LWWRegister, time::Timestamp, uid::UID};
use wasm_bindgen::prelude::*;

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
