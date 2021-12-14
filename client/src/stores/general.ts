import type { AppMessage } from "$types/messages";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export const serviceWorkerSupported = writable(true);
export const offline = writable(false);

// Dark mode/Light mode.
export const darkMode = writable(false);

// Navbar is shown/hidden.
export const showNavbar = writable(true);

// Mobile menu open/closed.
export const menuOpen = writable(false);

/**
 * ## Message worker
 *
 * Send a message to the active web worker.
 *
 * @param message Application message.
 */
export const messageWorker: Writable<(message: AppMessage) => void> = writable(() => {
	return;
});
