//! ## LWWRegister CRDT
//!
//! The *last-write-wins register (LWWRegister)* CRDT implements a wrapper over a generic type
//! that stores a timestamp as metadata and allows for conflict-free resolution using a simple
//! last-write-wins strategy.
use crate::time::timestamp::Timestamp;
use crate::uid::UID;

/// ## LWWRegister
///
/// Data structure representing a last-write-wins register wrapping a generic type.
#[derive(Clone, Default, Debug)]
pub struct LWWRegister<T: Clone + Default> {
    /// ### Timestamp
    ///
    /// HLC timestamp indicating the last update to the register.
    ts: Timestamp, // encoded: 8 bytes

    /// ### Value
    ///
    /// Value of the register.
    ///
    /// * The type of the value contained in the register is generic.
    value: T,
}

impl<T: Clone + Default> LWWRegister<T> {
    /// ### New LWWRegister
    ///
    /// Creates a new LWWRegister that wraps an arbitrary value.
    #[inline]
    pub fn new(ts: Timestamp, value: T) -> Self {
        Self { ts, value }
    }

    /// ### Get timestamp
    ///
    /// Returns the current timestamp of the register.
    #[inline]
    pub fn get_timestamp(&self) -> Timestamp {
        self.ts
    }

    /// ### Get value
    ///
    /// Returns a copy of the value wrapped by the register.
    #[inline]
    pub fn get_value(&self) -> T {
        self.value.clone()
    }

    /// ### Merge
    ///
    /// Merges the current register with another one. The register with the largest timestamp
    /// wins. Tied cases are decided by the lexicographical order of the node IDs.
    ///
    /// * `other` - Reference to the register to be merged.
    /// * `nid` - ID of the current node.
    /// * `other_id` - ID of the other node.
    ///
    /// Usage example - Create two registers on different nodes, merge their state.
    ///
    /// ```rust
    /// use crate::crdts::lwwregister::LWWRegister;
    /// use crate::crdts::time::hlc::{SysTimeHLC, HybridLogicalClock};
    /// use crate::crdts::uid::UID;
    ///
    /// let mut hlc = SysTimeHLC::default();
    /// let mut reg_a = LWWRegister::new(hlc.generate_timestamp(), false);
    /// let reg_b = LWWRegister::new(hlc.generate_timestamp(), true);
    /// reg_a.merge(&reg_b, UID::new(), UID::new());
    ///
    /// assert_eq!(reg_a.get_value(), true);
    /// ```
    #[inline]
    pub fn merge(&mut self, other: &Self, nid: UID, other_id: UID) -> () {
        if (self.ts, nid) < (other.ts, other_id) {
            self.value = other.get_value();
            self.ts = other.ts;
        }
    }
}

#[cfg(test)]
mod lwwregister_tests {}
