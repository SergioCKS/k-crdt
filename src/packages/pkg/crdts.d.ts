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
*/
export class GCounter {
  free(): void;
/**
* @param {string} node_id
* @returns {GCounter}
*/
  static init(node_id: string): GCounter;
/**
* @returns {string}
*/
  get_id(): string;
/**
* @returns {string}
*/
  get_node_id(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly generate_id: (a: number) => void;
  readonly __wbg_gcounter_free: (a: number) => void;
  readonly gcounter_init: (a: number, b: number) => number;
  readonly gcounter_get_id: (a: number, b: number) => void;
  readonly gcounter_get_node_id: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
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
