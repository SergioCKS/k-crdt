//! # WASM test script
//!
//! Compiles the Rust code using wasm-pack and tests functionality specific to client and server
//! nodes in a headless browser (chrome and firefox).
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin test-wasm
//! ```
use anyhow::Result;
use crdts::steps::test_wasm;

fn main() -> Result<()> {
    println!("Started Wasm tests.");
    test_wasm()?;
    println!("Wasm tests done!");

    Ok(())
}
