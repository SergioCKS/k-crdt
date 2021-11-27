//! # K-CRDT
//!
//! A library to manage a collection of CRDTS in a WASM context.
#[cfg(feature = "client")]
use crate::time::Timestamp;
#[cfg(feature = "client")]
use crate::lwwregister::{LWWRegister, RegisterMessage};
#[cfg(feature = "client")]
use crate::uid::UID;
#[cfg(feature = "client")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "client")]
use std::convert::TryInto;

#[cfg(feature = "server")]
pub mod engine;

pub mod gcounter;
pub mod lwwregister;
pub mod pncounter;
pub mod time;
pub mod uid;
pub mod vclock;
pub mod steps;

/// ## Create bool register
///
/// Constructs a last-write-wins register over a boolean value, serializes it and
/// returns the encoded version of the register.
///
/// * `ts` - Timestamp marking the moment of creation of the register.
/// * `value` - Initial value of the register.
#[cfg(feature = "client")]
#[wasm_bindgen(js_name = createBoolRegister)]
pub fn create_bool_register(ts: Timestamp, value: bool) -> Vec<u8> {
    let register = LWWRegister::new(ts, value);
    bincode::serialize(&register)
        .expect_throw("Error while serializing register")
}

#[cfg(feature = "client")]
#[wasm_bindgen(js_name = getBoolRegisterMessage)]
pub fn get_bool_register_message(ts: Timestamp, id: UID, encoded: Vec<u8>) -> Vec<u8> {
    let fixed: [u8; 9] = encoded.try_into()
        .expect_throw("Error trying to cast byte array to fixed size.");
    let message = RegisterMessage::new(ts, id, fixed);
    bincode::serialize(&message)
        .expect_throw("Error trying to serializing message")
}
