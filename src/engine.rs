//! # CRDT Engine
//!
//! An interface designed to manage a collection of CRDTs in a WASM context.
use crate::time::Timestamp;
use crate::uid::UID;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

//#region UpdateMessage
#[derive(Clone, Copy, Serialize, Deserialize)]
pub enum MessageCode {
    NewBoolRegister
}

#[derive(Serialize, Deserialize)]
pub struct UpdateMessage {
    nid: UID,
    ts: Timestamp,
    msg_code: MessageCode,
    payload: Vec<u8>,
}

impl UpdateMessage {
    pub fn new(nid: UID, ts: Timestamp, msg_code: MessageCode, payload: Vec<u8>) -> Self {
        Self { nid, ts, msg_code, payload }
    }
}
//#endregion

#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}

#[cfg(feature = "server")]
#[wasm_bindgen(js_name = parseUpdateMessage)]
pub fn parse_update_message(update_msg: Vec<u8>) -> String {
    let decoded: UpdateMessage = match bincode::deserialize(&update_msg[..]) {
        Ok(val) => val,
        Err(err) => return err.to_string()
    };
    decoded.nid.to_string()
}
