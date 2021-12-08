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
use crdts::{
    serialization::test_serialization,
    time::{
        client::{BrowserClock, BrowserHLC},
        clock::{test_clock, test_offsetted},
        hlc::{
            hlc_drift_is_limited, hlc_generate_timestamp_works, hlc_update_with_timestamp_works,
        },
        server::{ServerClock, ServerHLC},
    },
    uid::UID,
};
use wasm_bindgen_test::*;

// Configure wasm-pack to run in browser.
wasm_bindgen_test_configure!(run_in_browser);

// UID
#[wasm_bindgen_test]
fn uid_works() {
    let id = UID::new();
    let id_copy = id.clone();
    assert_eq!(id, id_copy);
    let id_str = String::from("qI5wz90BL_9SXG79gaCcz1");
    let id = UID::from_string_js(id_str.clone());
    assert_eq!(id.as_string(), id_str);
}

//#region BrowserClock
#[wasm_bindgen_test]
fn browser_clock_works() {
    test_clock::<BrowserClock>();
    test_offsetted::<BrowserClock>();
}

#[wasm_bindgen_test]
fn browser_clock_serialization_deserialization_works() {
    test_serialization::<BrowserClock>();
}
//#endregion

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

#[wasm_bindgen_test]
fn browser_hlc_serialization_deserialization_works() {
    test_serialization::<BrowserHLC>();
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

#[wasm_bindgen_test]
fn server_hlc_serialization_deserialization_works() {
    test_serialization::<ServerHLC>();
}
//#endregion
