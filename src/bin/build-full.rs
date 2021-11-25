//! # Build full script
//!
//! * Compiles Rust -> Wasm for the client.
//! * Compiles Rust -> Wasm for the server.
//! * Copies types.
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin build-full
//! ```
use crdts::steps::{
    client_wasm_pack_build,
    client_delete_gitignore,
    server_wasm_pack_build,
    server_copy_generated_code_to_worker_dir,
    server_write_worker_shim_to_worker_dir,
    server_replace_generated_import_with_custom_impl,
    copy_types
};
use anyhow::Result;

fn main() -> Result<()> {
    println!("Started build-full process.");

    println!("1. Building for client.");
    client_wasm_pack_build()?;
    client_delete_gitignore()?;
    println!("Client build done!");

    println!("2. Building for server.");
    server_wasm_pack_build()?;
    server_copy_generated_code_to_worker_dir()?;
    server_write_worker_shim_to_worker_dir()?;
    server_replace_generated_import_with_custom_impl()?;
    println!("Server build done!");

    println!("3. Copying types.");
    copy_types()?;
    println!("Types copied!");

    Ok(())
}