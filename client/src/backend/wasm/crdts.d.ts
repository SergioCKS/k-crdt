/* tslint:disable */
/* eslint-disable */
/**
* ## Generate ID
*
* Generates a unique ID in string format.
* @returns {string}
*/
export function generateId(): string;
/**
* ## Create bool register
*
* Constructs a last-write-wins register over a boolean value, serializes it and
* returns the encoded version of the register.
*
* * `ts` - Timestamp marking the moment of creation of the register.
* * `value` - Initial value of the register.
* * Throws a JS exception if the created register could not be serialized.
* @param {Timestamp} ts
* @param {boolean} value
* @returns {Uint8Array}
*/
export function createBoolRegister(ts: Timestamp, value: boolean): Uint8Array;
/**
* ## Get bool register message
*
* Constructs a message containing a bool register to be sent to a server node.
*
* * `ts` - Timestamp marking the moment of emission of the message
* * `id` - Unique ID of the register
* * `encoded` - Encoded version of the register
* * Throws a JS exception if:
*   * The the encoded register has the wrong number of bytes.
*   * The message could not be serialized.
* @param {Timestamp} ts
* @param {UID} id
* @param {Uint8Array} encoded
* @returns {Uint8Array}
*/
export function getBoolRegisterMessage(ts: Timestamp, id: UID, encoded: Uint8Array): Uint8Array;
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
* ## HLC Timestamp
*
* 64-bit HLC/NTP timestamp.
*/
export class Timestamp {
  free(): void;
/**
* ### To String
*
* Returns a string representation of the timestamp.
* @returns {string}
*/
  toString(): string;
}
/**
* ## UID
*
* Unique ID represented compactly as [`u128`].
*/
export class UID {
  free(): void;
/**
* @returns {UID}
*/
  getCopy(): UID;
/**
* @param {string} nid_str
* @returns {UID}
*/
  static fromString(nid_str: string): UID;
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
* @returns {string}
*/
  toString(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_uid_free: (a: number) => void;
  readonly uid_getCopy: (a: number) => number;
  readonly uid_fromString: (a: number, b: number) => number;
  readonly uid_new: () => number;
  readonly uid_toString: (a: number, b: number) => void;
  readonly __wbg_browserhlc_free: (a: number) => void;
  readonly browserhlc_new: () => number;
  readonly browserhlc_getOffset: (a: number, b: number) => void;
  readonly browserhlc_setOffset: (a: number, b: number, c: number) => void;
  readonly browserhlc_serialize: (a: number, b: number) => void;
  readonly browserhlc_deserialize: (a: number, b: number) => number;
  readonly browserhlc_generateTimestamp: (a: number) => number;
  readonly __wbg_timestamp_free: (a: number) => void;
  readonly timestamp_toString: (a: number, b: number) => void;
  readonly generateId: (a: number) => void;
  readonly createBoolRegister: (a: number, b: number, c: number) => void;
  readonly getBoolRegisterMessage: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
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
