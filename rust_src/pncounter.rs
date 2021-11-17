/// # PNCounter CRDT
///
/// Implementation of a _positive/negative counter_ CRDT
use crate::gcounter::GCounter;
use serde::{Deserialize, Serialize};

/// ## Positive/Negative Counter
///
/// Representation of a positive/negative counter CRDT.
#[derive(Serialize, Deserialize, Debug)]
pub struct PNCounter {
    pub positive: GCounter,
    pub negative: GCounter,
}

impl PNCounter {
    /// ### New PNCounter
    ///
    /// Creates a new PNCounter.
    ///
    /// * `node_id` - If given, initializes the count for the current node (as 0),
    ///     both for the positive as well for the negative counter.
    pub fn new(node_id: Option<&String>) -> Self {
        Self {
            positive: GCounter::new(node_id),
            negative: GCounter::new(node_id),
        }
    }

    /// ### Get PNCounter Value
    ///
    /// Returns the total count among all nodes.
    pub fn get_value(&self) -> u32 {
        self.positive.get_value() - self.negative.get_value()
    }

    /// ### Increment Counter
    ///
    /// Increments the counter by 1.
    pub fn increment(&mut self, node_id: &String) -> () {
        self.positive.increment(node_id);
    }

    /// ### Decrement Counter
    ///
    /// Decrements the counter by 1.
    pub fn decrement(&mut self, node_id: &String) -> () {
        self.negative.increment(node_id);
    }

    /// ### Merge
    ///
    /// Merges the state of the counter with the state of another counter.
    ///
    /// * `other_state` - Serialized state of another counter.
    pub fn merge(&mut self, other_state: &String) -> () {
        // Deserialize update message
        let other_counter: PNCounter = serde_json::from_str(other_state).unwrap();
        self.merge_from_state(&other_counter);
    }

    /// ### Merge from state
    ///
    /// Merges the state of the counter with the state of another counter.
    ///
    /// * `other_counter` - State of another counter.
    pub fn merge_from_state(&mut self, other_counter: &Self) -> () {
        self.positive.merge_from_state(&other_counter.positive);
        self.negative.merge_from_state(&other_counter.negative);
    }
}
