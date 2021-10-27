import { writable } from "svelte/store";

export const nodeId = writable("");
export const counterValue = writable(0);
export const registerValue = writable(false);
export const initialized = writable(false);
