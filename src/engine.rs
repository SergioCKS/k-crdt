//! # CRDT Engine
//!
//! An interface designed to manage a collection of CRDTs in a WASM context.
use crate::lwwregister::{LWWRegister, PackedBoolRegister};
// use crate::pncounter::PNCounter;
use crate::time::clock::Offset;
use crate::time::hlc::{BrowserHLC, HybridLogicalClock};
use crate::time::timestamp::Timestamp;
// use crate::uid::UID;
use wasm_bindgen::prelude::*;
use crate::uid::UID;
use serde::{Serialize, Deserialize};

//#region UpdateMessage
#[derive(Clone, Copy, Serialize, Deserialize)]
pub enum MessageCode {
    NewBoolRegister
}

#[derive(Serialize, Deserialize)]
pub struct UpdateMessage {
    nid: UID,
    mid: UID,
    ts: Timestamp,
    msg_code: MessageCode,
    payload: Vec<u8>,
}

impl UpdateMessage {
    pub fn new(nid: UID, mid: UID, ts: Timestamp, msg_code: MessageCode, payload: Vec<u8>) -> Self {
        Self {
            nid,
            mid,
            ts,
            msg_code,
            payload,
        }
    }
}
//#endregion

/// ## CRDT Engine
///
/// Representation of a CRDT engine.
#[wasm_bindgen]
pub struct Engine {
    /// ### Node ID
    ///
    /// ID of the node in the system.
    node_id: UID,

    /// ### Clock
    ///
    /// Hybrid logical clock for generating timestamps.
    clock: BrowserHLC,
    register: LWWRegister<bool>,
}

#[wasm_bindgen]
impl Engine {
    /// ### New CRDT engine
    ///
    /// Creates an engine instance.
    ///
    /// * `node_id` - The ID of the node in the system.
    ///     Can be omitted and set after engine creation.
    #[wasm_bindgen(constructor)]
    pub fn new(node_id: Option<UID>) -> Self {
        let mut clock = BrowserHLC::default();
        let ts = clock.generate_timestamp().unwrap();
        Self {
            node_id: node_id.unwrap_or(UID::new()),
            clock,
            register: LWWRegister::new(ts, false),
        }
    }

    /// ### Restore register
    ///
    /// Restores the state of the register from a serialized string.
    ///
    /// * `serialized` - JSON-serialized counter state.
    pub fn restore_register(&mut self, serialized: Option<String>) {
        if serialized.is_some() {
            self.register = serde_json::from_str(&serialized.unwrap()).unwrap();
        }
    }

    //#region Setters
    /// ### Set node ID
    ///
    /// Sets the ID of the node in the system.
    pub fn set_node_id(&mut self, node_id: UID) {
        self.node_id = node_id;
    }

    /// ### Set time offset
    ///
    /// Sets the time offset of the node.
    pub fn set_time_offset(&mut self, offset_millis: i64) -> Result<(), JsValue> {
        Ok(self.clock.set_offset(Offset::from_millis(offset_millis))?)
    }
    //#endregion

    /// ### Get node ID
    ///
    /// Returns the node ID associated with the engine.
    pub fn get_node_id(&self) -> UID {
        self.node_id
    }

    /// ### Get time offset
    ///
    /// Returns the time offset of the node.
    pub fn get_time_offset(&self) -> i64 {
        self.clock.get_offset().as_millis()
    }


    /// ### Get register value
    ///
    /// Returns the current value of the register.
    pub fn get_register_value(&self) -> bool {
        self.register.get_value()
    }


    /// ### Toggle register value
    ///
    /// Flips the value of the register.
    pub fn toggle_register(&mut self) {
        self.register.update_value(
            self.clock.generate_timestamp().unwrap(),
            !self.register.get_value(),
        );
    }

    /// ### Serialize counter
    ///
    /// Serialize the counter as JSON.
    // pub fn serialize_counter(&self) -> Result<String, JsValue> {
    //     let result = serde_json::to_string(&self.counter);
    //     match result {
    //         Ok(v) => Ok(v),
    //         Err(e) => Err(JsValue::from(format!(
    //             "Error while trying to serialize counter. {}",
    //             e
    //         ))),
    //     }
    // }
    /// Serialize register
    ///
    /// Serialize the register as JSON.
    // pub fn get_register_update_message(&self) -> Result<String, JsValue> {
    //     let msg = UpdateMessage::new(&self.node_id, self.register.clone());
    //     let result = serde_json::to_string(&msg);
    //     match result {
    //         Ok(v) => Ok(v),
    //         Err(e) => Err(JsValue::from(format!(
    //             "Error while trying to serialize register. {}",
    //             e
    //         ))),
    //     }
    // }

    // pub fn serialize_register(&self) -> Result<String, JsValue> {
    //     let result = serde_json::to_string(&self.register);
    //     match result {
    //         Ok(v) => Ok(v),
    //         Err(e) => Err(JsValue::from(format!(
    //             "Error while trying to serialize register. {}",
    //             e
    //         ))),
    //     }
    // }

    /// ### Merge from message
    ///
    /// Merge the state of the counter with the state of another
    ///
    /// * `msg` - Serialized state of another counter (update message from sync manage).
    // pub fn merge_from_message(&mut self, msg: Option<String>) {
    //     if msg.is_some() {
    //         self.counter.merge(&msg.unwrap());
    //     }
    // }

    /// ### Merge register from message
    ///
    /// Merge an incoming message with a serialized register.
    ///
    /// * `msg` - Serialized state of another register.
    /// * `other_id` - ID of the other node.
    // pub fn merge_register_from_message(&mut self, msg: Option<String>, other_nid: String) {
    //     if msg.is_some() {
    //         self.register
    //             .merge_from_message(&msg.unwrap(), &self.node_id, &other_nid);
    //     }
    // }

    /// ### Generate timestamp
    ///
    /// Generates an HLC timestamp.
    pub fn generate_timestamp(&mut self) -> Result<Timestamp, JsValue> {
        Ok(self.clock.generate_timestamp()?)
    }

    /// ### Create bool register
    ///
    /// Creates a new last-write-wins register wrapping a boolean value, serializes it and passes
    /// the result to the client.
    pub fn create_bool_register(&mut self, initial: bool) -> PackedBoolRegister {
        let ts = self.clock.generate_timestamp().unwrap();
        let register = LWWRegister::new(ts, initial);
        let encoded: Vec<u8> = bincode::serialize(&register).unwrap();
        PackedBoolRegister::new(UID::new(), initial, encoded)
    }
}

#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}

#[wasm_bindgen]
pub fn parse_update_message(update_msg: Vec<u8>) -> String {
    let decoded: UpdateMessage = match bincode::deserialize(&update_msg[..]) {
        Ok(val) => val,
        Err(err) => return err.to_string()
    };
    decoded.nid.to_string()
}
