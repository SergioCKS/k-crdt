//! # K-CRDT
//!
//! A library to manage a collection of CRDTS in a WASM context.
use wasm_bindgen::prelude::*;
use crate::time::Timestamp;
use crate::lwwregister::{LWWRegister, PackedBoolRegister};
use crate::uid::UID;

pub mod engine;
pub mod gcounter;
pub mod lwwregister;
pub mod pncounter;
pub mod time;
pub mod uid;
pub mod vclock;
pub mod steps;

#[wasm_bindgen(js_name = createBoolRegister)]
pub fn create_bool_register(ts: Timestamp, value: bool) -> PackedBoolRegister {
    let uid = UID::new();
    let register = LWWRegister::new(ts, value);
    let encoded = bincode::serialize(&register)
        .expect_throw("Error while serializing register");
    PackedBoolRegister::new(uid, value, encoded)
}


