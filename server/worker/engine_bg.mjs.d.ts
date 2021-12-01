/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function get_message(): string;
/**
*/
export class ServerHLC {
  free(): void;
/**
* ### New server HLC
*
* Constructs a server HLC with a default initial state.
*/
  constructor();
/**
* ### Generate timestamp
*
* Generate a timestamp polling the local time.
* @returns {Timestamp}
*/
  generateTimestamp(): Timestamp;
/**
* ### Update with timestamp
*
* Updates the clock using a message timestamp.
* @param {Timestamp} ts
* @returns {Timestamp}
*/
  updateWithTimestamp(ts: Timestamp): Timestamp;
/**
* ### Serialize
*
* Generate an encoded version of the clock.
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize
*
* Generates a clock from an encoded version.
* @param {Uint8Array} encoded
* @returns {ServerHLC}
*/
  static deserialize(encoded: Uint8Array): ServerHLC;
/**
*/
  last_time: Timestamp;
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
/**
* ### Serialize
*
* Returns an encoded version of a timestamp.
*
* * Size: 8 bytes
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize
*
* Constructs a [`Timestamp`] object from an encoded version.
* @param {Uint8Array} encoded
* @returns {Timestamp}
*/
  static deserialize(encoded: Uint8Array): Timestamp;
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
* ### UID to string
*
* Returns the string representation of the UID.
* @returns {string}
*/
  toString(): string;
/**
* ### Serialize
*
* Returns an encoded version of the UID.
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize
*
* Constructs a UID object from an encoded version.
* @param {Uint8Array} encoded
* @returns {UID}
*/
  static deserialize(encoded: Uint8Array): UID;
}
