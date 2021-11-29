//! # Wasm client tests
//!
//! Tests running client-specific functionality in a headless browser.
//!
//! Usage:
//!
//! ```shell
//! wasm-pack test --headless --chrome --firefox --features client
//! ```
//!
//! Or using the convenience binary:
//!
//! ```shell
//! cargo run --bin test-wasm
//! ```
use crdts::time::{
    client::{BrowserClock, BrowserHLC},
    clock::{test_clock, test_offsetted},
    hlc::{hlc_drift_is_limited, hlc_generate_timestamp_works, hlc_update_with_timestamp_works},
    server::{ServerClock, ServerHLC},
};
use wasm_bindgen_test::wasm_bindgen_test_configure;
use wasm_bindgen_test::*;

// Configure wasm-pack to run in browser.
wasm_bindgen_test_configure!(run_in_browser);

// BrowserClock
#[wasm_bindgen_test]
fn browser_clock_works() {
    test_clock::<BrowserClock>();
    test_offsetted::<BrowserClock>();
}

// ServerClock
#[wasm_bindgen_test]
fn server_clock_works() {
    test_clock::<ServerClock>();
}

//#region BrowserHLC
#[wasm_bindgen_test]
fn browser_hlc_generate_timestamp_works() {
    hlc_generate_timestamp_works::<BrowserClock, BrowserHLC>();
}

#[wasm_bindgen_test]
fn browser_hlc_update_with_timestamp_works() {
    hlc_update_with_timestamp_works::<BrowserClock, BrowserHLC>();
}

#[wasm_bindgen_test]
fn browser_hlc_drift_is_limited() {
    hlc_drift_is_limited::<BrowserClock, BrowserHLC>();
}
//#endregion

//#region ServerHLC
#[wasm_bindgen_test]
fn server_hlc_generate_timestamp_works() {
    hlc_generate_timestamp_works::<ServerClock, ServerHLC>();
}

#[wasm_bindgen_test]
fn server_hlc_update_with_timestamp_works() {
    hlc_update_with_timestamp_works::<ServerClock, ServerHLC>();
}

#[wasm_bindgen_test]
fn server_hlc_drift_is_limited() {
    hlc_drift_is_limited::<ServerClock, ServerHLC>();
}
//#endregion
