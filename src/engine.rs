//! # CRDT Engine
//!
//! An interface designed to manage a collection of CRDTs in a WASM context.
use wasm_bindgen::prelude::*;
#[cfg(feature = "server")]
use crate::lwwregister::RegisterMessage;

#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}

#[cfg(feature = "server")]
#[wasm_bindgen(js_name = parseUpdateMessage)]
pub fn parse_update_message(update_msg: Vec<u8>) -> String {
    let decoded: RegisterMessage = match bincode::deserialize(&update_msg[..]) {
        Ok(val) => val,
        Err(err) => return err.to_string()
    };
    decoded.register.id.to_string()
}
