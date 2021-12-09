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
* Returns the timestamp in binary format as an array of 8 bytes.
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize
*
* Constructs a [`Timestamp`] from an encoded version.
*
* #### Errors
*
* A JS exception is thrown if the wrong number of bytes are given.
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
*/
  constructor();
/**
* ### UID from string
*
* Generates a new UID from a valid string representation.
*
* * `nid_str` - String representation of the the UID.
*
* #### Errors
*
* A JS exception is thrown if the provided string does not correspond to a valid UID.
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
* Returns the UID in binary format as an array of 16 bytes.
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* ### Deserialize
*
* Constructs a UID object from an encoded version.
*
* #### Errors
*
* A JS exception is thrown if a wrong number of bytes are given.
* @param {Uint8Array} encoded
* @returns {UID}
*/
  static deserialize(encoded: Uint8Array): UID;
}
