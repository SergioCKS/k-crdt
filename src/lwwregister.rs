//! ## LWWRegister CRDT
//!
//! The *last-write-wins register (LWWRegister)* CRDT implements a wrapper over a generic type
//! that stores a timestamp as metadata and allows for conflict-free resolution using a simple
//! last-write-wins strategy.
use crate::time::timestamp::Timestamp;
use crate::uid::UID;
use serde::{Deserialize,Serialize};

//#region Packed register
/// ## Register Message
///
/// Register with added metadata to be sent as an update message.
///
/// * Encoded size: 24 + REG_SIZE bytes (where REG_SIZE is the size of an encoded register)
#[derive(Serialize, Deserialize)]
pub struct RegisterMessage<const REG_SIZE: usize> {
    /// ### Message emission timestamp
    ///
    /// Timestamp marking the moment of emission of the message.
    ///
    /// * Encoding size: 8 bytes
    pub ts: Timestamp,

    /// ### Register ID
    ///
    /// Unique ID of the register in the system.
    ///
    /// * Encoding size: 16 bytes
    pub id: UID,

    /// ### Register
    ///
    /// Encoded version of the register.
    ///
    /// * Encoding size: SIZE bytes
    #[serde(with = "serde_arrays")]
    pub register: [u8; REG_SIZE]
}

impl<const REG_SIZE: usize> RegisterMessage<REG_SIZE> {
    pub fn new(ts: Timestamp, id: UID, register: [u8; REG_SIZE]) -> RegisterMessage<REG_SIZE> {
        Self { ts, id, register }
    }
}

// impl <const REG_SIZE: usize> Serialize for RegisterMessage<REG_SIZE> {
//     fn serialize<S>(&self, serializer: S) -> Result<Ok, Error> where S: Serializer {
//         todo!()
//     }
// }
//
// impl <const REG_SIZE: usize> Deserialize for RegisterMessage<REG_SIZE> {
//     fn deserialize_in_place<D>(deserializer: D, place: &mut Self) -> Result<(), serde::de::Error> where D: Deserializer<'de> {
//         todo!()
//     }
// }
//#endregion

/// ## LWWRegister
///
/// Data structure representing a last-write-wins register.
#[derive(Deserialize, Serialize, Clone)]
pub struct LWWRegister<T: Clone> {
    /// ### Timestamp
    ///
    /// HLC timestamp indicating the last update to the register.
    ts: Timestamp, // bincode: 8 bytes

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
    pub fn new(ts: Timestamp, value: T) -> Self {
        Self { ts, value }
    }

    /// ### Get timestamp
    ///
    /// Returns the current timestamp of the register.
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
    use std::convert::TryInto;

    #[derive(Serialize, Deserialize)]
    struct TestStruct {
        encoded: [u8; 9]
    }

    impl TestStruct {
        fn new(encoded: [u8; 9]) -> Self {
            Self { encoded }
        }
    }

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

    #[test]
    fn some() {
        let register = LWWRegister::new(Timestamp::default(), true);
        let enc_register = bincode::serialize(&register).unwrap();
        let cast: [u8; 9] = enc_register.try_into().unwrap();
        let test_struct  = TestStruct::new(cast);
        let enc_test_struct = bincode::serialize(&test_struct).unwrap();
        println!("Encoded test struct: {} bytes", enc_test_struct.len()); // Expected 9 bytes

        // let packed = PackedRegister::new(
        //     Some(UID::new()), // 16 bytes
        //     RegisterValueType::Bool, // 4 bytes
        //     enc_register // 9 bytes
        // );
        // let enc_packed = bincode::serialize(&packed).unwrap();
        // println!("Packed register: {}", enc_packed.len());
    }
}
