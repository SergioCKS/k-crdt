//! # Server interface
//!
//! Utilites meant to be used exclusively in client-side environments.
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_message() -> String {
    String::from("Hello, hello-wasm! V3")
}
