//! # GCounter CRDT
//!
//! Implementation of a _grow-only-counter_ CRDT.
use std::cmp::max;
use std::collections::BTreeMap;

/// ## Grow-Only Counter
///
/// Representation of a grow-only counter CRDT.
#[derive(Debug, PartialEq, Clone)]
pub struct GCounter {
    /// ### Node counts
    ///
    ///  Map tracking the counts of each node in the system.
    pub state: BTreeMap<String, u32>,
}

impl GCounter {
    /// ### New GCounter
    ///
    /// Creates a new GCounter.
    ///
    /// * `node_id` - If given, initializes the count for the current node (as 0).
    pub fn new(node_id: Option<&String>) -> Self {
        let mut counts = BTreeMap::new();
        if node_id.is_some() {
            counts.insert(String::from(node_id.unwrap()), 0);
        }
        Self { state: counts }
    }

    /// ### Get GCounter Value
    ///
    /// Returns the total count among all nodes.
    pub fn get_value(&self) -> u32 {
        self.state.values().sum()
    }

    /// ### Increment Counter
    ///
    /// Increments the counter by 1.
    pub fn increment(&mut self, node_id: &String) -> () {
        *self.state.entry(node_id.clone()).or_insert(0) += 1;
    }

    /// ### Merge from state
    ///
    /// Merges the state of the counter with the state of another counter.
    ///
    /// * `other_counter` - State of another counter.
    pub fn merge_from_state(&mut self, other_counter: &Self) {
        // Update partial counts
        for (node_id, partial_count) in &other_counter.state {
            let new_partial_count: u32;
            match self.state.get(&node_id.to_string()) {
                Some(curr_val) => {
                    // Both counters have a partial count for the same node. Take the largest one.
                    new_partial_count = max(*curr_val, *partial_count);
                }
                None => {
                    // The current counter does not have a partial count for the node.
                    // Copy the value from the other counter.
                    new_partial_count = *partial_count;
                }
            }
            self.state.insert(node_id.clone(), new_partial_count);
        }
    }
}
