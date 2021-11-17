use crdts;

#[test]
fn generate_uid_works() {
    let uid = crdts::uid::UID::new();
    assert_eq!(uid.to_string().chars().count(), 22, "Generated UID should consists of 22 characters.");
}