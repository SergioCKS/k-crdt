/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function generate_id(): string;
/**
*/
export class GCounter {
  free(): void;
/**
* @returns {GCounter}
*/
  static default(): GCounter;
/**
* @returns {BigInt}
*/
  get_count(): BigInt;
/**
* @returns {boolean}
*/
  is_empty(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly generate_id: (a: number) => void;
  readonly __wbg_gcounter_free: (a: number) => void;
  readonly gcounter_default: () => number;
  readonly gcounter_get_count: (a: number, b: number) => void;
  readonly gcounter_is_empty: (a: number) => number;
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
