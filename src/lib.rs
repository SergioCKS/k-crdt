//! # K-CRDT
//!
//! A library to manage a collection of CRDTS in a WASM context.
#[cfg(feature = "client")]
use crate::time::Timestamp;
#[cfg(feature = "client")]
use crate::lwwregister::LWWRegister;
#[cfg(feature = "client")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "client")]
use crate::lwwregister::{PackedRegister, RegisterValueType};


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
/// returns a packed version of the register.
///
/// * `ts` - Timestamp marking the moment of creation of the register.
/// * `value` - Initial value of the register.
#[cfg(feature = "client")]
#[wasm_bindgen(js_name = createBoolRegister)]
pub fn create_bool_register(ts: Timestamp, value: bool) -> PackedRegister {
    let register = LWWRegister::new(ts, value);
    let encoded = bincode::serialize(&register)
        .expect_throw("Error while serializing register");
    PackedRegister::new(None, RegisterValueType::Bool, encoded)
}
