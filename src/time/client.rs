use super::{Offset, Clock, TimePollError, Timestamp, hlc::HybridLogicalClock};
use serde::{Serialize, Deserialize};
use wasm_bindgen::{JsCast, prelude::*};
use std::time::Duration;

//#region Clock
/// ## Browser clock
///
/// A clock relying on browser APIs to poll time.
///
/// * The [`Performance` interface](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
///   is used to poll time. The time resolution is vendor-dependent, but is at least in the millisecond range.
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct BrowserClock {
    offset: Offset // bincode: 8 bytes
}

impl Clock for BrowserClock {
    fn get_offset(&self) -> Offset {
        self.offset
    }

    fn set_offset_unchecked(&mut self, offset: Offset) -> () {
        self.offset = offset;
    }

    fn poll_duration() -> Result<Duration, TimePollError> {
        if let Ok(value) =
        js_sys::Reflect::get(&js_sys::global(), &JsValue::from_str("performance"))
        {
            let performance = value.unchecked_into::<web_sys::Performance>();
            let now_micros = ((performance.time_origin() + performance.now()) * 1_000f64) as u64;
            Ok(Duration::from_micros(now_micros))
        } else {
            Err(TimePollError::PerformanceNotAccessible(String::from(
                "The performance object is not accessible. {}",
            )))
        }
    }
}
//#endregion

//#region HLC
/// ## Browser HLC
///
/// Hybrid logical clock based on browser time.
#[wasm_bindgen]
#[derive(Clone, Copy, Default, Serialize, Deserialize)]
pub struct BrowserHLC { // bincode: 16 bytes
/// ### Last time
///
/// Last accepted time as HLC/NTP timestamp.
last_time: Timestamp, // bincode: 8 bytes

    /// ### Clock
    ///
    /// Internal clock used for polling time.
    clock: BrowserClock // bincode: 8 bytes
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
    pub fn set_offset_millis(&mut self, offset: i64) -> Result<(), JsValue> {
        Ok(self.clock.set_offset(Offset::from_millis(offset))?)
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
        let decoded: BrowserHLC = bincode::deserialize(&encoded[..]).expect_throw("Failed to deserialize HLC.");
        decoded
    }

    /// ### Generate timestamp (JS)
    ///
    /// Generates a timestamp polling the browser time source.
    #[wasm_bindgen(js_name = generateTimestamp)]
    pub fn generate_timestamp_js(&mut self) -> Result<Timestamp, JsValue> {
        Ok(self.generate_timestamp()?)
    }
}

impl BrowserHLC {
    pub fn get_offset(&self) -> Offset {
        self.clock.get_offset()
    }

    pub fn set_offset(&mut self, offset: Offset) -> Result<(), TimePollError> {
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