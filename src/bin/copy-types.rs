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
use anyhow::Result;
use crdts::steps::copy_types;

fn main() -> Result<()> {
    println!("Copying types.");
    copy_types()?;
    println!("Types copied!");
    Ok(())
}