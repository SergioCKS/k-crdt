use wasm_bindgen::UnwrapThrowExt;

pub trait Serialize: Default {
    fn serialize(&self) -> Vec<u8>;
}

pub trait Deserialize: Default {
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
