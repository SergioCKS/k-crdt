//! # Build full script
//!
//! * Compiles Rust -> Wasm for the server.
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin build-server
//! ```
use crdts::steps::{
    server_wasm_pack_build,
    server_copy_generated_code_to_worker_dir,
    server_write_worker_shim_to_worker_dir,
    server_replace_generated_import_with_custom_impl
};
use anyhow::Result;

fn main() -> Result<()> {
    println!("Started build-server process.");
    server_wasm_pack_build()?;
    server_copy_generated_code_to_worker_dir()?;
    server_write_worker_shim_to_worker_dir()?;
    server_replace_generated_import_with_custom_impl()?;
    println!("Server build done!");

    Ok(())
}