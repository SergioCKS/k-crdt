//! # K-CRDT
//!
//! A library to manage a collection of CRDTS in a WASM context.
//!
//! ## Usage
//!
//! **1. Generate the JS package using `wasm-pack`**
//!
//! ```shell
//! wasm-pack build --target web
//! ```
//!
//! **2. Import the package inside a web project**
//!
//!
//! ```js
//! import init, { Engine } from "<path_to_package>/pkg/crdts";
//!
//! ...
//! ```
//!
//! **3. Initialize WASM**
//!
//! Before interacting with the interface and its objects,
//! it is necessary to initialize WASM in the browser by calling the `init` method.
//!
//! ```js
//! await init();
//! ```
//!
//! **4. Start the CRDT Engine**
//!
//! Once WASM was successfully initialized, we can create an instance of the CRDT engine.
//!
//! The library is designed to maintain only one large engine instance
//! that manages all CRDTs as opposed to maintaining several small CRDTs.
//!
//! The engine can optionally be given a _node ID_ that identifies the node in the system,
//! this ID is used by several CRDTs (for example by GCounters) to record operations made by
//! different actors. If no ID is given on initialization, a random ID is generated.
//!
//! ```js
//! const nodeId = ... // Retrieve node ID
//! const engine = Engine.new(nodeId);
//! ```
//!
pub mod engine;
pub mod gcounter;
pub mod lwwregister;
pub mod pncounter;
pub mod time;
pub mod uid;
pub mod vclock;
