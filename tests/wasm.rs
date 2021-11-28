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
    client::BrowserClock,
    clock::{test_clock, test_offsetted},
    server::ServerClock,
};
use wasm_bindgen_test::wasm_bindgen_test_configure;
use wasm_bindgen_test::*;

// Configure wasm-pack to run in browser.
wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn browser_clock_works() {
    test_clock::<BrowserClock>();
    test_offsetted::<BrowserClock>();
}

#[wasm_bindgen_test]
fn server_clock_works() {
    test_clock::<ServerClock>();
}
