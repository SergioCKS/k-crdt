//! # Client time
//!
//! Time-related objects meant to be used exclusively in a client node environment.
use super::{clock::MAX_OFFSET, hlc::HybridLogicalClock, Clock, Offset, Timestamp};
use crate::time::clock::Offsetted;
use serde::{Deserialize, Serialize};
use wasm_bindgen::{prelude::*, JsCast};

//#region Clock
/// ## Browser clock
///
/// A clock relying on browser APIs to poll time.
///
/// * The [`Performance` interface](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
///   is used to poll time. The time resolution is vendor-dependent, but is at least in the millisecond range.
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct BrowserClock {
    offset: Offset, // bincode: 8 bytes
}

impl Clock for BrowserClock {
    /// ## Poll time
    ///
    /// Polls time from the performance API in browser.
    fn poll_time_ms(&self) -> f64 {
        // `web_sys` doesn't provide a handle to the performance object from a worker context,
        // as a workaround, we access the performance API from the global context via js_sys.
        let performance =
            js_sys::Reflect::get(&js_sys::global(), &JsValue::from_str("performance"))
                .unwrap_throw()
                .unchecked_into::<web_sys::Performance>();

        // `performance.now()` gives the time elapsed since the process was spawned, but the spawn
        // time since UNIX epoch is also available in `performance.time_origin()`. The times are
        // provided in milliseconds as floats.
        performance.time_origin() + performance.now() + (self.offset.as_millis() as f64)
    }
}

impl Offsetted for BrowserClock {
    fn get_offset(&self) -> Offset {
        self.offset
    }

    fn set_offset_unchecked(&mut self, offset: Offset) -> () {
        self.offset = offset;
    }
}
//#endregion

//#region HLC
/// ## Browser HLC
///
/// Hybrid logical clock based on browser time.
#[wasm_bindgen]
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct BrowserHLC {
    // bincode: 16 bytes
    /// ### Last time
    ///
    /// Last accepted time as HLC/NTP timestamp.
    last_time: Timestamp, // bincode: 8 bytes

    /// ### Clock
    ///
    /// Internal clock used for polling time.
    clock: BrowserClock, // bincode: 8 bytes
}

#[wasm_bindgen]
impl BrowserHLC {
    /// ### New browser HLC
    ///
    /// Creates a new HLC based on browser time.
    ///
    /// * Returns default HLC
    #[wasm_bindgen(constructor)]
    pub fn new() -> BrowserHLC {
        Self::default()
    }

    /// ### Get clock offset
    ///
    /// Returns the offset of the internal clock.
    ///
    /// * Returns offset in milliseconds
    #[wasm_bindgen(js_name = getOffset)]
    pub fn get_offset_millis(&self) -> i64 {
        self.clock.get_offset().as_millis()
    }

    /// ### Set clock offset
    ///
    /// Updates the offset of the internal clock.
    ///
    /// * `offset` - Offset in milliseconds
    #[wasm_bindgen(js_name = setOffset)]
    pub fn set_offset_millis(&mut self, offset: i64) -> () {
        self.clock.set_offset(Offset::from_millis(offset))
    }

    /// ### Serialize HLC
    ///
    /// Returns an updated encoded version of the HLC.
    pub fn serialize(&self) -> Vec<u8> {
        bincode::serialize(&self).expect_throw("Failed to serialize HLC.")
    }

    /// ### Deserialize HLC
    ///
    /// Constructs an HLC from an encoded version.
    pub fn deserialize(encoded: Vec<u8>) -> BrowserHLC {
        bincode::deserialize::<BrowserHLC>(&encoded[..]).unwrap_throw()
    }

    /// ### Generate timestamp (JS)
    ///
    /// Generates a timestamp polling the browser time source.
    #[wasm_bindgen(js_name = generateTimestamp)]
    pub fn generate_timestamp_js(&mut self) -> Timestamp {
        self.generate_timestamp()
    }
}

impl BrowserHLC {
    pub fn get_offset(&self) -> Offset {
        self.clock.get_offset()
    }

    pub fn set_offset(&mut self, offset: Offset) -> () {
        self.clock.set_offset(offset)
    }
}

impl HybridLogicalClock<BrowserClock> for BrowserHLC {
    fn get_last_time(&self) -> Timestamp {
        self.last_time
    }

    fn set_last_time(&mut self, new_time: Timestamp) {
        self.last_time = new_time;
    }

    fn get_internal_clock(&self) -> BrowserClock {
        self.clock
    }
}
//#endregion
