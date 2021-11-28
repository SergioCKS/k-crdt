use super::{hlc::HybridLogicalClock, Clock, Timestamp};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

//#region Clock
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct ServerClock;

impl Clock for ServerClock {
    fn poll_time_ms(&self) -> f64 {
        js_sys::Date::now()
    }
}
//#endregion

//#region HLC
#[wasm_bindgen]
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
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
    pub fn serialize(&self) -> Vec<u8> {
        bincode::serialize(&self).unwrap_throw()
    }

    /// ### Deserialize
    ///
    /// Generates a clock from an encoded version.
    pub fn deserialize(encoded: Vec<u8>) -> ServerHLC {
        bincode::deserialize::<ServerHLC>(&encoded[..]).unwrap_throw()
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
//#endregion
