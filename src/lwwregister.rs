//! ## LWWRegister CRDT
//!
//! The *last-write-wins register (LWWRegister)* CRDT implements a wrapper over a generic type
//! that stores a timestamp as metadata and allows for conflict-free resolution using a simple
//! last-write-wins strategy.
use crate::time::timestamp::Timestamp;
use crate::uid::UID;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

//#region Packed register
#[derive(Serialize, Deserialize)]
pub struct RegisterMessage {
    pub nid: UID,
    pub ts: Timestamp,
    pub register: PackedRegister
}

impl RegisterMessage {
    pub fn new(nid: UID, ts: Timestamp, register: PackedRegister) -> Self {
        Self { nid, ts, register }
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Serialize, Deserialize)]
pub enum RegisterValueType {
    Bool = 0
}

/// ## Packed register
///
/// Encoded version of a register with some added metadata.
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct PackedRegister {
    /// ### Uinque ID
    ///
    /// Unique identifier of the register.
    pub id: UID,

    /// ### Value type
    ///
    /// Type of the value wrapped by the register.
    #[wasm_bindgen(js_name = "valueType")]
    pub value_type: RegisterValueType,

    /// ## Encoded value
    ///
    /// Encoded version of the register.
    encoded: Vec<u8>
}

#[wasm_bindgen]
impl PackedRegister {
    /// ### New packed register
    ///
    /// Constructs a new packed register.
    ///
    /// * `id` - If not provided, a random UID is generated and used instead.
    /// * `value_type` - Type of the value wrapped by the register.
    /// * `encoded` - Encoded version of the register.
    #[wasm_bindgen(constructor)]
    pub fn new(id: Option<UID>, value_type: RegisterValueType, encoded: Vec<u8>) -> Self {
        Self {
            id: id.unwrap_or(UID::new()),
            value_type,
            encoded
        }
    }

    /// ### Get encoded
    ///
    /// Returns the encoded version of the register.
    #[wasm_bindgen(js_name = getEncoded)]
    pub fn get_encoded(&self) -> Vec<u8> {
        self.encoded.clone()
    }

    #[wasm_bindgen(js_name = getMessage)]
    pub fn get_message(&self, nid: UID, ts: Timestamp) -> Vec<u8> {
        let message = RegisterMessage::new(nid, ts, Self {
            id: self.id,
            value_type: self.value_type,
            encoded: self.encoded.clone()
        });
        bincode::serialize(&message).expect_throw("Error while serializing message.")
    }
}
//#endregion

/// ## LWWRegister
///
/// Data structure representing a last-write-wins register.
#[derive(Deserialize, Serialize, Clone)]
pub struct LWWRegister<T: Clone> {
    /// ### Timestamp
    ///
    /// HLC timestamp indicating the last update to the register.
    ts: Timestamp,

    /// ### Value
    ///
    /// Value of the register.
    ///
    /// * The type of the value contained in the register is generic.
    value: T,
}

impl<T: Clone> LWWRegister<T> {
    /// ### New LWWRegister
    ///
    /// Creates a new LWWRegister that wraps an arbitrary value.
    ///
    /// * `ts` - Timestamp generated at the moment of creation.
    /// * `value` - Value of the register. The type of the value is arbitrary
    ///   but cannot change throughout the lifetime of the register.
    /// * `returns` - LWWRegister wrapping the given value with an initial timestamp.
    pub fn new(ts: Timestamp, value: T) -> Self {
        Self { ts, value }
    }


    pub fn get_timestamp(&self) -> Timestamp {
        self.ts
    }

    /// ### Get value
    ///
    /// Returns a copy of the value wrapped by the register.
    pub fn get_value(&self) -> T {
        self.value.clone()
    }

    /// ### Update
    ///
    /// Updates the timestamp and value of the register.
    ///
    /// * `ts` - Timestamp generated at the moment of update.
    /// * `new_value` - New value that will replace the previous one.
    pub fn update_value(&mut self, ts: Timestamp, new_value: T) -> () {
        self.ts = ts;
        self.value = new_value;
    }

    /// ### Merge
    ///
    /// Merges the current register with another one. The register with the largest timestamp
    /// wins. Tied cases are decided by the lexicographical order of the respective nodes.
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
    /// let ts1 = hlc.generate_timestamp().unwrap();
    /// let ts2 = hlc.generate_timestamp().unwrap();
    ///
    /// let nid_a = UID::new();
    /// let nid_b = UID::new();
    ///
    /// let mut reg_a = LWWRegister::new(ts1, false);
    /// let reg_b = LWWRegister::new(ts2, true);
    ///
    /// reg_a.merge(&reg_b, nid_a, nid_b);
    ///
    /// assert_eq!(reg_a.get_value(), true, "The value of the register with the largest timestamp should win.");
    /// assert_eq!(reg_a.get_timestamp(), ts2, "The timestamp of the winner should be updated as well.");
    /// ```
    pub fn merge(&mut self, other: &Self, nid: UID, other_id: UID) -> () {
        if (self.ts, nid) < (other.ts, other_id) {
            self.value = other.get_value();
            self.ts = other.ts;
        }
    }
}

#[cfg(test)]
mod lwwregister_tests {
    use super::*;
    use crate::time::hlc::{SysTimeHLC, HybridLogicalClock};

    #[test]
    fn merge_works() {
        let mut hlc = SysTimeHLC::default();
        let ts1 = hlc.generate_timestamp().unwrap();
        let ts2 = hlc.generate_timestamp().unwrap();

        let nid_a = UID::new();
        let nid_b = UID::new();

        let mut reg_a = LWWRegister::new(ts1, false);
        let reg_b = LWWRegister::new(ts2, true);

        reg_a.merge(&reg_b, nid_a, nid_b);

        assert_eq!(
            reg_a.get_value(),
            true,
            "The value of the register with the largest timestamp should win."
        );
        assert_eq!(
            reg_a.get_timestamp(),
            ts2,
            "The timestamp of the winner should be updated as well."
        );
    }

    // #[test]
    // fn constructor_getters_setters_work() {
    //     //#region Constructor
    //     let nid_a = String::from("a");
    //     let mut register_a = LWWRegister::new(Some(&nid_a), false);
    //     //#endregion
    //
    //     //#region Test getters
    //     let mut clock = VClock::new(Some(&nid_a));
    //     assert_eq!(register_a.get_value(), false);
    //     assert_eq!(register_a.get_timestamp(), clock);
    //     //#endregion
    //
    //     //#region Test setters
    //     register_a.update_value(true, &nid_a);
    //     assert_eq!(register_a.get_value(), true);
    //     clock.increment(&nid_a);
    //     assert_eq!(register_a.get_timestamp(), clock);
    //     //#endregion
    // }
}
