/* tslint:disable */
/* eslint-disable */
/**
* ## Generate ID
* > Generates a universally unique ID.
*
* IDs consist of 21 uniformly random characters from the alphabet `A-Za-z0-9_-`.
* To generate random data, a `ThreadRNG` is used.
* @returns {string}
*/
export function generate_id(): string;
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
* * `node_id` - The ID of the node in the system. If omitted, a newly generated ID is used.
* @param {string | undefined} node_id
* @returns {Engine}
*/
  static new(node_id?: string): Engine;
/**
* ### Get node ID
*
* Returns the node ID associated with the engine.
* @returns {string}
*/
  get_node_id(): string;
/**
* ### Get counter value
*
* Returns the current value of the counter.
* @returns {number}
*/
  get_counter_value(): number;
/**
* ### Increment counter
*
* Increments the counter by 1 as the node associated with the engine.
*/
  increment_counter(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_engine_free: (a: number) => void;
  readonly engine_new: (a: number, b: number) => number;
  readonly engine_get_node_id: (a: number, b: number) => void;
  readonly engine_get_counter_value: (a: number) => number;
  readonly engine_increment_counter: (a: number) => void;
  readonly generate_id: (a: number) => void;
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
