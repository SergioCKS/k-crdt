pub mod clock;
pub mod hlc;
pub mod timestamp;

#[cfg(any(feature = "client", test))]
pub mod client;

#[cfg(any(feature = "server", test))]
pub mod server;

pub use self::clock::{Clock, Offset};
pub use self::timestamp::Timestamp;

#[cfg(feature = "client")]
pub use self::client::BrowserClock;
#[cfg(feature = "server")]
pub use self::server::ServerClock;
