//#region Type sizes
pub const UID_SIZE: usize = 16;
pub const TS_SIZE: usize = 8;
pub const BOOL_SIZE: usize = 1;
//#endregion

pub trait Serialize<const NUM_BYTES: usize> {
    fn serialize(&self) -> [u8; NUM_BYTES];
}

pub trait Deserialize<const NUM_BYTES: usize>: Serialize<NUM_BYTES> {
    fn deserialize(encoded: [u8; NUM_BYTES]) -> Self;
}

impl Serialize<BOOL_SIZE> for bool {
    fn serialize(&self) -> [u8; BOOL_SIZE] {
        [*self as u8]
    }
}

impl Deserialize<BOOL_SIZE> for bool {
    fn deserialize(encoded: [u8; BOOL_SIZE]) -> Self {
        encoded[0] != 0
    }
}

pub fn test_serialization<T, const NUM_BYTES: usize>()
where
    T: Serialize<NUM_BYTES> + Deserialize<NUM_BYTES> + Default + Eq + PartialEq + std::fmt::Debug,
{
    let obj = T::default();

    assert_eq!(
        obj,
        T::deserialize(obj.serialize()),
        "Serialization + deserialization shouldn't change the value."
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bool_serialization_deserialization_works() {
        test_serialization::<bool, BOOL_SIZE>();
    }
}
