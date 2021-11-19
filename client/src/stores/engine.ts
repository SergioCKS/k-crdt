import { writable } from "svelte/store";

export const initialized = writable(false);
export const registers = writable({});
