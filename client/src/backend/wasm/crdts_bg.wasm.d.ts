/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_uid_free(a: number): void;
export function uid_new(): number;
export function uid_from_string(a: number, b: number): number;
export function uid_as_string(a: number, b: number): void;
export function uid_as_byte_string(a: number, b: number): void;
export function generate_id(a: number): void;
export function __wbg_engine_free(a: number): void;
export function engine_new(a: number): number;
export function engine_restore_register(a: number, b: number, c: number): void;
export function engine_set_node_id(a: number, b: number): void;
export function engine_set_time_offset(a: number, b: number): void;
export function engine_get_node_id(a: number): number;
export function engine_get_time_offset(a: number): number;
export function engine_get_register_value(a: number): number;
export function engine_toggle_register(a: number): void;
export function engine_generate_timestamp(a: number): number;
export function engine_create_bool_register(a: number, b: number): number;
export function get_message(a: number): void;
export function parse_update_message(a: number, b: number, c: number): void;
export function __wbg_timestamp_free(a: number): void;
export function timestamp_as_u64(a: number, b: number): void;
export function timestamp_get_time(a: number, b: number): void;
export function timestamp_get_seconds(a: number): number;
export function timestamp_get_fractions(a: number): number;
export function timestamp_get_count(a: number): number;
export function timestamp_get_nanoseconds(a: number): number;
export function timestamp_increase_counter(a: number): void;
export function test_clock(a: number): void;
export function __wbg_packedboolregister_free(a: number): void;
export function packedboolregister_new(a: number, b: number, c: number, d: number): number;
export function packedboolregister_get_id(a: number, b: number): void;
export function packedboolregister_get_value(a: number): number;
export function packedboolregister_get_encoded(a: number, b: number): void;
export function packedboolregister_get_update_message(a: number, b: number, c: number, d: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
