/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function generate_id(): string;
/**
* @returns {string}
*/
export function get_message(): string;
/**
* @param {Uint8Array} update_msg
* @returns {string}
*/
export function parse_update_message(update_msg: Uint8Array): string;
/**
* @returns {BigInt}
*/
export function test_clock(): BigInt;
/**
* ## CRDT Engine
*
* Representation of a CRDT engine.
*/
export class Engine {
  free(): void;
/**
* ### New CRDT engine
*
* Creates an engine instance.
*
* * `node_id` - The ID of the node in the system.
*     Can be omitted and set after engine creation.
* @param {UID | undefined} node_id
*/
  constructor(node_id?: UID);
/**
* ### Restore register
*
* Restores the state of the register from a serialized string.
*
* * `serialized` - JSON-serialized counter state.
* @param {string | undefined} serialized
*/
  restore_register(serialized?: string): void;
/**
* ### Set node ID
*
* Sets the ID of the node in the system.
* @param {UID} node_id
*/
  set_node_id(node_id: UID): void;
/**
* ### Set time offset
*
* Sets the time offset of the node.
* @param {number} offset_millis
*/
  set_time_offset(offset_millis: number): void;
/**
* ### Get node ID
*
* Returns the node ID associated with the engine.
* @returns {UID}
*/
  get_node_id(): UID;
/**
* ### Get time offset
*
* Returns the time offset of the node.
* @returns {number}
*/
  get_time_offset(): number;
/**
* ### Get register value
*
* Returns the current value of the register.
* @returns {boolean}
*/
  get_register_value(): boolean;
/**
* ### Toggle register value
*
* Flips the value of the register.
*/
  toggle_register(): void;
/**
* ### Serialize counter
*
* Serialize the counter as JSON.
* Serialize register
*
* Serialize the register as JSON.
* ### Merge from message
*
* Merge the state of the counter with the state of another
*
* * `msg` - Serialized state of another counter (update message from sync manage).
* ### Merge register from message
*
* Merge an incoming message with a serialized register.
*
* * `msg` - Serialized state of another register.
* * `other_id` - ID of the other node.
* ### Generate timestamp
*
* Generates an HLC timestamp.
* @returns {Timestamp}
*/
  generate_timestamp(): Timestamp;
/**
* ### Create bool register
*
* Creates a new last-write-wins register wrapping a boolean value, serializes it and passes
* the result to the client.
* @param {boolean} initial
* @returns {PackedBoolRegister}
*/
  create_bool_register(initial: boolean): PackedBoolRegister;
}
/**
*/
export class PackedBoolRegister {
  free(): void;
/**
* @param {UID} id
* @param {boolean} value
* @param {Uint8Array} encoded
* @returns {PackedBoolRegister}
*/
  static new(id: UID, value: boolean, encoded: Uint8Array): PackedBoolRegister;
/**
* @returns {string}
*/
  get_id(): string;
/**
* @returns {boolean}
*/
  get_value(): boolean;
/**
* @returns {Uint8Array}
*/
  get_encoded(): Uint8Array;
/**
* @param {UID} nid
* @param {Timestamp} ts
* @returns {Uint8Array}
*/
  get_update_message(nid: UID, ts: Timestamp): Uint8Array;
}
/**
*/
export class ServerHLC {
  free(): void;
/**
*/
  constructor();
/**
* @returns {Timestamp}
*/
  get_timestamp(): Timestamp;
/**
* @param {Timestamp} ts
* @returns {Timestamp}
*/
  update(ts: Timestamp): Timestamp;
/**
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* @param {Uint8Array} encoded
* @returns {ServerHLC}
*/
  static deserialize(encoded: Uint8Array): ServerHLC;
}
/**
* ## HLC Timestamp
*
* 64-bit HLC timestamp implemented as a tuple struct over [`u64`].
*/
export class Timestamp {
  free(): void;
/**
* ### As `u64`
*
* Returns the timestamp as a 64-bit unsigned integer.
* @returns {BigInt}
*/
  as_u64(): BigInt;
/**
* ### Get time part
*
* Returns the counter part of the timestamp.
* @returns {BigInt}
*/
  get_time(): BigInt;
/**
* ### Get seconds
*
* Returns the seconds part of the timestamp (leading 32 bits).
* @returns {number}
*/
  get_seconds(): number;
/**
* ### Get second fractions
*
* Returns the second fractions part of the timestamp.
* @returns {number}
*/
  get_fractions(): number;
/**
* ### Get counter part
*
* Returns the counter part of the timestamp.
* @returns {number}
*/
  get_count(): number;
/**
* ### Get nanoseconds
*
* Returns the second fractions part as nanoseconds.
* @returns {number}
*/
  get_nanoseconds(): number;
/**
* ### Increase counter
*
* Increases the counter part of the timestamp by 1.
*/
  increase_counter(): void;
}
/**
* ## UID
*
* Unique ID represented compactly as [`u128`].
*/
export class UID {
  free(): void;
/**
* ### Generate new ID
*
* Generates a new random unique ID.
*
* An ID can be represented as a string consisting of 21 random characters over the
* alphabet `A-Za-z0-9_-` followed by a random character over the alphabet `ABCD`
* (22 characters total).
*
* To generate random data, a `ThreadRNG` is used.
*/
  constructor();
/**
* @param {string} nid_str
* @returns {UID}
*/
  static from_string(nid_str: string): UID;
/**
* @returns {string}
*/
  as_string(): string;
/**
* @returns {Uint8Array}
*/
  as_byte_string(): Uint8Array;
}
