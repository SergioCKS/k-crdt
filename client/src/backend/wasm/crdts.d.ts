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
* @param {Timestamp} ts
* @param {boolean} value
* @returns {PackedBoolRegister}
*/
export function createBoolRegister(ts: Timestamp, value: boolean): PackedBoolRegister;
/**
* ## Browser HLC
*
* Hybrid logical clock based on browser time.
*/
export class BrowserHLC {
  free(): void;
/**
* ### New browser HLC
*
* Creates a new HLC based on browser time.
*
* * Returns default HLC
*/
  constructor();
/**
* ### Get clock offset
*
* Returns the offset of the internal clock.
*
* * Returns offset in milliseconds
* @returns {BigInt}
*/
  getOffset(): BigInt;
/**
* ### Set clock offset
*
* Updates the offset of the internal clock.
*
* * `offset` - Offset in milliseconds
* @param {BigInt} offset
*/
  setOffset(offset: BigInt): void;
/**
* ### Serialize HLC
*
* Returns an updated encoded version of the HLC.
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize HLC
*
* Constructs an HLC from an encoded version.
* @param {Uint8Array} encoded
* @returns {BrowserHLC}
*/
  static deserialize(encoded: Uint8Array): BrowserHLC;
/**
* ### Generate timestamp (JS)
*
* Generates a timestamp polling the browser time source.
* @returns {Timestamp}
*/
  generateTimestamp(): Timestamp;
}
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
* @param {BigInt} offset_millis
*/
  set_time_offset(offset_millis: BigInt): void;
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
* @returns {BigInt}
*/
  get_time_offset(): BigInt;
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
* @returns {Uint8Array}
*/
  getEncoded(): Uint8Array;
/**
* ### Get update message
*
* Constructs an encoded update message from the register.
* @param {UID} nid
* @param {Timestamp} ts
* @returns {Uint8Array}
*/
  getUpdateMessage(nid: UID, ts: Timestamp): Uint8Array;
/**
*/
  id: UID;
/**
*/
  value: boolean;
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
  toString(): string;
/**
* @returns {Uint8Array}
*/
  as_byte_string(): Uint8Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_packedboolregister_free: (a: number) => void;
  readonly __wbg_get_packedboolregister_id: (a: number) => number;
  readonly __wbg_set_packedboolregister_id: (a: number, b: number) => void;
  readonly __wbg_get_packedboolregister_value: (a: number) => number;
  readonly __wbg_set_packedboolregister_value: (a: number, b: number) => void;
  readonly packedboolregister_new: (a: number, b: number, c: number, d: number) => number;
  readonly packedboolregister_getEncoded: (a: number, b: number) => void;
  readonly packedboolregister_getUpdateMessage: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_browserhlc_free: (a: number) => void;
  readonly browserhlc_new: () => number;
  readonly browserhlc_getOffset: (a: number, b: number) => void;
  readonly browserhlc_setOffset: (a: number, b: number, c: number) => void;
  readonly browserhlc_serialize: (a: number, b: number) => void;
  readonly browserhlc_deserialize: (a: number, b: number) => number;
  readonly browserhlc_generateTimestamp: (a: number) => number;
  readonly __wbg_serverhlc_free: (a: number) => void;
  readonly serverhlc_new: () => number;
  readonly serverhlc_get_timestamp: (a: number) => number;
  readonly serverhlc_update: (a: number, b: number) => number;
  readonly serverhlc_serialize: (a: number, b: number) => void;
  readonly serverhlc_deserialize: (a: number, b: number) => number;
  readonly __wbg_uid_free: (a: number) => void;
  readonly uid_new: () => number;
  readonly uid_from_string: (a: number, b: number) => number;
  readonly uid_toString: (a: number, b: number) => void;
  readonly uid_as_byte_string: (a: number, b: number) => void;
  readonly generate_id: (a: number) => void;
  readonly __wbg_engine_free: (a: number) => void;
  readonly engine_new: (a: number) => number;
  readonly engine_restore_register: (a: number, b: number, c: number) => void;
  readonly engine_set_node_id: (a: number, b: number) => void;
  readonly engine_set_time_offset: (a: number, b: number, c: number) => void;
  readonly engine_get_node_id: (a: number) => number;
  readonly engine_get_time_offset: (a: number, b: number) => void;
  readonly engine_get_register_value: (a: number) => number;
  readonly engine_toggle_register: (a: number) => void;
  readonly engine_generate_timestamp: (a: number) => number;
  readonly engine_create_bool_register: (a: number, b: number) => number;
  readonly get_message: (a: number) => void;
  readonly parse_update_message: (a: number, b: number, c: number) => void;
  readonly createBoolRegister: (a: number, b: number) => number;
  readonly __wbg_timestamp_free: (a: number) => void;
  readonly timestamp_as_u64: (a: number, b: number) => void;
  readonly timestamp_get_time: (a: number, b: number) => void;
  readonly timestamp_get_seconds: (a: number) => number;
  readonly timestamp_get_fractions: (a: number) => number;
  readonly timestamp_get_count: (a: number) => number;
  readonly timestamp_get_nanoseconds: (a: number) => number;
  readonly timestamp_increase_counter: (a: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
