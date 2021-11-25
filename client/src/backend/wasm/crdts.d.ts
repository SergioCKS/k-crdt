/* tslint:disable */
/* eslint-disable */
/**
* ## Create bool register
*
* Constructs a last-write-wins register over a boolean value, serializes it and
* returns a packed version of the register.
*
* * `ts` - Timestamp marking the moment of creation of the register.
* * `value` - Initial value of the register.
* @param {Timestamp} ts
* @param {boolean} value
* @returns {PackedRegister}
*/
export function createBoolRegister(ts: Timestamp, value: boolean): PackedRegister;
/**
* @returns {string}
*/
export function get_message(): string;
/**
* @returns {string}
*/
export function generate_id(): string;
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
* ## Packed register
*
* Encoded version of a register with some added metadata.
*/
export class PackedRegister {
  free(): void;
/**
* ### New packed register
*
* Constructs a new packed register.
*
* * `id` - If not provided, a random UID is generated and used instead.
* * `encoded` - Encoded version of the register.
* @param {UID | undefined} id
* @param {Uint8Array} encoded
*/
  constructor(id: UID | undefined, encoded: Uint8Array);
/**
* ### Get encoded
*
* Returns the encoded version of the register.
* @returns {Uint8Array}
*/
  getEncoded(): Uint8Array;
/**
* ### Get update message
*
* Constructs an encoded update message from the register.
*
* * `nid` - Unique ID of the node in the system.
* * `ts` - Timemstamp marking the moment of message emission.
* @param {UID} nid
* @param {Timestamp} ts
* @returns {Uint8Array}
*/
  getUpdateMessage(nid: UID, ts: Timestamp): Uint8Array;
/**
* ### Uinque ID
*
* Unique identifier of the register.
*/
  id: UID;
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
  static fromString(nid_str: string): UID;
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
  readonly __wbg_packedregister_free: (a: number) => void;
  readonly __wbg_get_packedregister_id: (a: number) => number;
  readonly __wbg_set_packedregister_id: (a: number, b: number) => void;
  readonly packedregister_new: (a: number, b: number, c: number) => number;
  readonly packedregister_getEncoded: (a: number, b: number) => void;
  readonly packedregister_getUpdateMessage: (a: number, b: number, c: number, d: number) => void;
  readonly createBoolRegister: (a: number, b: number) => number;
  readonly get_message: (a: number) => void;
  readonly __wbg_uid_free: (a: number) => void;
  readonly uid_new: () => number;
  readonly uid_fromString: (a: number, b: number) => number;
  readonly uid_toString: (a: number, b: number) => void;
  readonly uid_as_byte_string: (a: number, b: number) => void;
  readonly generate_id: (a: number) => void;
  readonly __wbg_timestamp_free: (a: number) => void;
  readonly timestamp_as_u64: (a: number, b: number) => void;
  readonly timestamp_get_time: (a: number, b: number) => void;
  readonly timestamp_get_seconds: (a: number) => number;
  readonly timestamp_get_fractions: (a: number) => number;
  readonly timestamp_get_count: (a: number) => number;
  readonly timestamp_get_nanoseconds: (a: number) => number;
  readonly timestamp_increase_counter: (a: number) => void;
  readonly __wbg_browserhlc_free: (a: number) => void;
  readonly browserhlc_new: () => number;
  readonly browserhlc_getOffset: (a: number, b: number) => void;
  readonly browserhlc_setOffset: (a: number, b: number, c: number) => void;
  readonly browserhlc_serialize: (a: number, b: number) => void;
  readonly browserhlc_deserialize: (a: number, b: number) => number;
  readonly browserhlc_generateTimestamp: (a: number) => number;
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
