use wasm_bindgen::UnwrapThrowExt;

pub trait Serialize {
    fn serialize(&self) -> Vec<u8>;
}

pub trait Deserialize {
    fn deserialize(encoded: Vec<u8>) -> Self;
}

impl Serialize for bool {
    fn serialize(&self) -> Vec<u8> {
        vec![*self as u8]
    }
}

impl Deserialize for bool {
    fn deserialize(encoded: Vec<u8>) -> Self {
        *encoded.first().unwrap_throw() != 0
    }
}

pub fn test_serialization<
    T: Serialize + Deserialize + Default + Eq + PartialEq + std::fmt::Debug,
>() {
    let obj = T::default();
    let encoded = obj.serialize();

    println!("{}, {}", encoded.len(), std::mem::size_of_val(&obj));
    assert!(
        encoded.len() <= std::mem::size_of_val(&obj),
        "Serialization should maintain the size of the value."
    );

    let decoded = T::deserialize(encoded);

    assert_eq!(
        obj, decoded,
        "Serialization + deserialization shouldn't change the value."
    );
}
