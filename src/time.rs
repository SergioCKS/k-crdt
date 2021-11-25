pub mod clock;
pub mod hlc;
pub mod timestamp;

pub use self::timestamp::Timestamp;
pub use self::clock::{Clock, Offset, TimePollError};

#[cfg(feature = "client")]
pub use self::clock::BrowserClock;
#[cfg(feature = "server")]
pub use self::clock::ServerClock;
#[cfg(test)]
pub use self::clock::SysTimeClock;