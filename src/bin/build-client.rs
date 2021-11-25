//! # Build client script
//!
//! * Compiles Rust -> Wasm for the client.
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin build-client
//! ```
use crdts::steps::{
    client_wasm_pack_build,
    client_delete_gitignore,
};
use anyhow::Result;

fn main() -> Result<()> {
    println!("Started build-client process.");
    client_wasm_pack_build()?;
    client_delete_gitignore()?;
    println!("Client build done!");

    Ok(())
}