import { writable } from "svelte/store";

export const serviceWorkerSupported = writable(true);
export const offline = writable(false);
