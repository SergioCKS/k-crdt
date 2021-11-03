/* tslint:disable */
/* eslint-disable */
/**
* @returns {number}
*/
export function test_clock(): number;
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
* @param {string} node_id
* @returns {Engine}
*/
  static new(node_id: string): Engine;
/**
* ### Restore state
*
* Restores the state of the counter from a serialized string.
*
* * `serialized` - JSON-serialized counter state.
* @param {string | undefined} serialized
*/
  restore_state(serialized?: string): void;
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
* @param {string} node_id
*/
  set_node_id(node_id: string): void;
/**
* ### Set time offset
*
* Sets the time offset of the node.
* @param {number} time_offset
*/
  set_time_offset(time_offset: number): void;
/**
* ### Get node ID
*
* Returns the node ID associated with the engine.
* @returns {string}
*/
  get_node_id(): string;
/**
* ### Get time offset
*
* Returns the time offset of the node.
* @returns {number}
*/
  get_time_offset(): number;
/**
* ### Get counter value
*
* Returns the current value of the counter.
* @returns {number}
*/
  get_counter_value(): number;
/**
* ### Get register value
*
* Returns the current value of the register.
* @returns {boolean}
*/
  get_register_value(): boolean;
/**
* ### Increment counter
*
* Increments the counter by 1 as the node associated with the engine.
*/
  increment_counter(): void;
/**
* ### Decrement counter
*
* Decrements the counter by 1 as the node associated with the engine.
*/
  decrement_counter(): void;
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
* @returns {string}
*/
  serialize_counter(): string;
/**
* Serialize register
*
* Serialize the register as JSON.
* @returns {string}
*/
  get_register_update_message(): string;
/**
* @returns {string}
*/
  serialize_register(): string;
/**
* ### Merge from message
*
* Merge the state of the counter with the state of another
*
* * `msg` - Serialized state of another counter (update message from sync manage).
* @param {string | undefined} msg
*/
  merge_from_message(msg?: string): void;
/**
* ### Merge register from message
*
* Merge an incoming message with a serialized register.
*
* * `msg` - Serialized state of another register.
* * `other_id` - ID of the other node.
* @param {string | undefined} msg
* @param {string} other_nid
*/
  merge_register_from_message(msg: string | undefined, other_nid: string): void;
}
/**
*/
export class UID {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_engine_free: (a: number) => void;
  readonly engine_new: (a: number, b: number) => number;
  readonly engine_restore_state: (a: number, b: number, c: number) => void;
  readonly engine_restore_register: (a: number, b: number, c: number) => void;
  readonly engine_set_node_id: (a: number, b: number, c: number) => void;
  readonly engine_set_time_offset: (a: number, b: number) => void;
  readonly engine_get_node_id: (a: number, b: number) => void;
  readonly engine_get_time_offset: (a: number) => number;
  readonly engine_get_counter_value: (a: number) => number;
  readonly engine_get_register_value: (a: number) => number;
  readonly engine_increment_counter: (a: number) => void;
  readonly engine_decrement_counter: (a: number) => void;
  readonly engine_toggle_register: (a: number) => void;
  readonly engine_serialize_counter: (a: number, b: number) => void;
  readonly engine_get_register_update_message: (a: number, b: number) => void;
  readonly engine_serialize_register: (a: number, b: number) => void;
  readonly engine_merge_from_message: (a: number, b: number, c: number) => void;
  readonly engine_merge_register_from_message: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly test_clock: () => number;
  readonly __wbg_uid_free: (a: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
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
