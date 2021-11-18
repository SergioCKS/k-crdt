use crate::gcounter::GCounter;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::cmp::Ordering::{Equal, Greater, Less};

/// ## VClock
///
/// Implementation of a logical vector clock.
///
/// * Implemented as a tuple struct over GCounter using the `newtype` pattern.
/// * Implements the `PartialOrd` trait which allows for comparison of VClock timestamps.
#[derive(PartialEq, Clone, Debug, Deserialize, Serialize)]
pub struct VClock(GCounter);

impl VClock {
    pub fn new(node_id: Option<&String>) -> Self {
        Self(GCounter::new(node_id))
    }
    pub fn increment(&mut self, node_id: &String) -> () {
        self.0.increment(node_id);
    }
    pub fn merge(&mut self, other: &Self) -> () {
        self.0.merge_from_state(&other.0);
    }
}

impl PartialOrd for VClock {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        let mut result = Equal;
        for (node_id, other_count) in other.0.state.iter() {
            let partial_result: Ordering;
            match self.0.state.get(node_id) {
                Some(current_count) => {
                    if current_count < other_count {
                        partial_result = Less;
                    } else if current_count == other_count {
                        partial_result = Equal;
                    } else {
                        partial_result = Greater;
                    }
                }
                None => {
                    if *other_count == 0 {
                        partial_result = Equal;
                    } else {
                        partial_result = Less;
                    }
                }
            }

            if partial_result == result {
                continue;
            } else if result == Equal {
                result = partial_result;
            } else {
                return None;
            }
        }
        // At this point we only have to check the keys in current clock that are not in the other.
        // This could only make the current clock greater than the other or don't alter the result.
        if result == Greater {
            return Some(result);
        }

        let positive_outliers = self
            .0
            .state
            .iter()
            .find(|&(k, &v)| !other.0.state.contains_key(k) && v > 0);

        if positive_outliers.is_some() {
            if result == Equal {
                return Some(Greater);
            }
            return None;
        }
        return Some(result);
    }
}

#[cfg(test)]
mod vclock_tests {
    use super::*;

    #[test]
    fn comparison_works() {
        let mut vclock_a = VClock::new(Some(&String::from("a")));
        let mut vclock_b = VClock::new(Some(&String::from("b")));
        // vclock_a: { a: 0 }, vclock_b: { b: 0 }. Should be EQUAL.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Equal));

        vclock_a.increment(&String::from("a"));
        // vclock_a: { a: 1 }, vclock_b: { b: 0 }. Should be GREATER.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Greater));

        vclock_b.increment(&String::from("a"));
        // vclock_a: { a: 1 }, vclock_b: { a: 1, b: 0 }. Should be EQUAL.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Equal));

        vclock_a.increment(&String::from("b"));
        // vclock_a: { a: 1, b: 1 }, vclock_b: { a: 1, b: 0 }. Should be GREATER.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Greater));

        vclock_b.increment(&String::from("b"));
        // vclock_a: { a: 1, b: 1 }, vclock_b: { a: 1, b: 1 }. Should be EQUAL.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Equal));

        vclock_b.increment(&String::from("b"));
        // vclock_a: { a: 1, b: 1 }, vclock_b: { a: 1, b: 2 }. Should be LESS.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), Some(Less));

        vclock_a.increment(&String::from("a"));
        // vclock_a: { a: 2, b: 1 }, vclock_b: { a: 1, b: 2 }. Should be CONCURRENT.
        assert_eq!(vclock_a.partial_cmp(&vclock_b), None);
    }
}
