//! # K-CRDT
//!
//! A library to manage a collection of CRDTS in a WASM context.
pub mod gcounter;
pub mod lwwregister;
pub mod pncounter;
pub mod time;
pub mod uid;
pub mod vclock;
#[cfg(feature = "client")]
pub mod client;
#[cfg(feature = "server")]
pub mod server;
#[cfg(all(not(feature = "client"), not(feature = "server")))]
pub mod steps;
