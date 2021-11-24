//! # Copy type files
//!
//! Type definitions used in both client and server code are defined in a common directory.
//! This script copies those files to their corresponding places in the client and server directories.
//!
//! ### Usage
//!
//! In the project root directory, run:
//!
//! ```shell
//! cargo run --bin copy-types
//! ```
use std::{path::PathBuf, fs};
use anyhow::Result;

const TYPES_DIR: &str = "types";
const CLIENT_TYPES_DIR: &str = "client/src/types";
const MOD_DIR: &str = "server/worker";

fn main() -> Result<()> {
    let messages_src = PathBuf::from(TYPES_DIR).join("messages.ts");
    let client_messages_dst = PathBuf::from(CLIENT_TYPES_DIR).join("messages.ts");
    let server_messages_dst = PathBuf::from(MOD_DIR).join("messages.mjs.ts");

    for (src, dst) in [
        (&messages_src, client_messages_dst),
        (&messages_src, server_messages_dst)
    ] {
        if src.exists() {
            fs::copy(src, dst)?;
        }
    }

    println!("Types copied!");

    Ok(())
}