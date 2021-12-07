import type { AppMessage } from "$types/messages";
import { Writable, writable } from "svelte/store";

export const serviceWorkerSupported = writable(true);
export const offline = writable(false);

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
