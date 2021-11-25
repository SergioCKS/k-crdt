//! # WASM build script
//!
//! Compiles the Rust code using wasm-pack and sets up the necessary files and shims for the
//! WASM module to be accessible both from the client node code as well as from the server node code.
//!
//! Based on [worker-build](https://github.com/cloudflare/workers-rs/tree/main/worker-build).
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin build-wasm
//! ```
use crdts::steps::{
   client_wasm_pack_build,
   client_delete_gitignore,
   server_wasm_pack_build,
   server_copy_generated_code_to_worker_dir,
   server_write_worker_shim_to_worker_dir,
   server_replace_generated_import_with_custom_impl
};
use anyhow::Result;

fn main() -> Result<()> {
   println!("Started build proccess.");

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

   Ok(())
}
