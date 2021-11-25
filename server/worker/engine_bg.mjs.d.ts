/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function get_message(): string;
/**
* @param {Uint8Array} update_msg
* @returns {string}
*/
export function parseUpdateMessage(update_msg: Uint8Array): string;
/**
* @returns {string}
*/
export function generate_id(): string;
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
