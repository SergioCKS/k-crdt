//! # Server time interface
//!
//! Time-related objects meant to be used exclusively in a server-node environment.

use super::{hlc::HybridLogicalClock, Clock, Timestamp};
use crate::serialization::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

//#region Clock
#[derive(Clone, Copy, Default)]
pub struct ServerClock;

impl Clock for ServerClock {
    fn poll_time_ms(&self) -> f64 {
        js_sys::Date::now()
    }
}
//#endregion

//#region HLC
#[wasm_bindgen]
#[derive(Clone, Copy, Default)]
pub struct ServerHLC {
    pub last_time: Timestamp,
}

#[wasm_bindgen]
impl ServerHLC {
    /// ### New server HLC
    ///
    /// Constructs a server HLC with a default initial state.
    #[wasm_bindgen(constructor)]
    #[inline]
    pub fn new() -> ServerHLC {
        ServerHLC::default()
    }

    /// ### Generate timestamp
    ///
    /// Generate a timestamp polling the local time.
    #[wasm_bindgen(js_name = generateTimestamp)]
    pub fn generate_timestamp_js(&mut self) -> Timestamp {
        self.generate_timestamp()
    }

    /// ### Update with timestamp
    ///
    /// Updates the clock using a message timestamp.
    #[wasm_bindgen(js_name = updateWithTimestamp)]
    pub fn update_with_timestamp_js(&mut self, ts: Timestamp) -> Timestamp {
        self.update_with_timestamp(ts).unwrap_throw()
    }

    /// ### Serialize
    ///
    /// Generate an encoded version of the clock.
    #[wasm_bindgen(js_name = serialize)]
    pub fn serialize_js(&self) -> Vec<u8> {
        self.serialize()
    }

    /// ### Deserialize
    ///
    /// Generates a clock from an encoded version.
    #[wasm_bindgen(js_name = deserialize)]
    pub fn deserialize_js(encoded: Vec<u8>) -> ServerHLC {
        ServerHLC::deserialize(encoded)
    }
}

impl HybridLogicalClock<ServerClock> for ServerHLC {
    fn get_last_time(&self) -> Timestamp {
        self.last_time
    }

    fn set_last_time(&mut self, new_time: Timestamp) {
        self.last_time = new_time;
    }

    fn get_internal_clock(&self) -> ServerClock {
        ServerClock::default()
    }
}

impl Serialize for ServerHLC {
    fn serialize(&self) -> Vec<u8> {
        self.last_time.serialize()
    }
}

impl Deserialize for ServerHLC {
    fn deserialize(encoded: Vec<u8>) -> Self {
        ServerHLC {
            last_time: Timestamp::deserialize(encoded),
        }
    }
}
//#endregion
