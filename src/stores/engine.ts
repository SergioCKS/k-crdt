import { writable } from "svelte/store";

export const nodeId = writable("");
export const initialized = writable(false);
export const registers = writable({});
