//! # CRDT Engine
//!
//! An interface designed to manage a collection of CRDTs in a WASM context.
#[cfg(feature = "server")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "server")]
use crate::lwwregister::{RegisterMessage, META_SIZE, BOOL_VAL_SIZE, BOOL_REG_SIZE};

#[cfg(feature = "server")]
#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}

#[cfg(feature = "server")]
#[wasm_bindgen(js_name = parseUpdateMessage)]
pub fn parse_update_message(update_msg: Vec<u8>) -> String {
    match update_msg.len() - META_SIZE {
        BOOL_VAL_SIZE => {
            match bincode::deserialize::<RegisterMessage<BOOL_REG_SIZE>>(&update_msg[..]) {
                Ok(decoded) => decoded.id.to_string(),
                Err(error) => error.to_string()
            }
        }
        _ => String::from("Unknown register type received.")
    }
}
