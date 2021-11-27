//! # Server interface
//!
//! Utilites meant to be used exclusively in client-side environments.
use super::{
    lwwregister::{RegisterMessage, META_SIZE, BOOL_VAL_SIZE, BOOL_REG_SIZE},
    time::Timestamp
};
use wasm_bindgen::{prelude::*, throw_str};

#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}

#[wasm_bindgen(js_name = parseUpdateMessage)]
pub fn parse_update_message(update_msg: Vec<u8>) -> Timestamp {
    match update_msg.len() - META_SIZE {
        BOOL_VAL_SIZE => {
            bincode::deserialize::<RegisterMessage<BOOL_REG_SIZE>>(&update_msg[..])
                .unwrap_throw()
                .ts
        }
        _ => throw_str("Unknown register type received.")
    }
}
