import { writable } from "svelte/store";

/**
 * ## Backend initialized
 *
 * Marks whether or not the backend interfaces (local db, WASM and sync connection) were
 * initialized and are responsive.
 */
export const initialized = writable(false);
export const registers = writable({});
