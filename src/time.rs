pub mod clock;
pub mod hlc;
pub mod timestamp;

#[cfg(feature = "client")]
pub mod client;

#[cfg(feature = "server")]
pub mod server;

pub use self::timestamp::Timestamp;
pub use self::clock::{Clock, Offset, TimePollError};

#[cfg(feature = "client")]
pub use self::client::BrowserClock;
#[cfg(feature = "server")]
pub use self::server::ServerClock;
