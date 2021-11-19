/**
 * # Web worker entrypoint
 *
 * Web worker registration script.
 *
 * * Registers event listeners: `install`, `activate`, `message`, `fetch`.
 * * Must be referenced in the Svelte config file. Sveltekit is responsible for registration.
 *
 * @module
 */
import { cacheBaseFiles, clearOldFiles, onFetch } from "./cache";
import type { ClientMessage } from "$types/messages";
import { handleClientMessage } from "./messaging";

/**
 * ## Worker scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

/**
 * ## Register `install` event listener
 *
 * Adds the `install` event handler indicating when the installation process is running/finished.
 *
 * * Caches the necessary files to run the application.
 */
worker.addEventListener("install", (event) => {
	event.waitUntil(
		cacheBaseFiles().then(() => {
			worker.skipWaiting();
		})
	);
});

/**
 * ## Register `activate` event listener
 *
 * Adds the `activate` event handler indicating when the activation process is running. Once the process is finished, the new worker overrides the previous one.
 *
 * * Clears old cache files.
 */
worker.addEventListener("activate", (event) => {
	event.waitUntil(
		clearOldFiles().then(() => {
			worker.clients.claim();
		})
	);
});

/**
 * ## Register `message` event listener
 *
 * Adds te `message` event handler.
 *
 * * Parses the incoming event and relays the resulting objects to the event handler.
 * * Assumes the caller uses the correct data format as opposed to perform runtime checks.
 */
worker.addEventListener("message", async (event) => {
	const msgData = event.data as ClientMessage;
	try {
		await handleClientMessage(event.source, msgData.msgCode, msgData.payload);
	} catch (error) {
		console.error(`Error while handling client event!`, error);
	}
});

/**
 * ## Register `fetch` event listener
 *
 * Adds the `fetch` event listener and handles exceptions.
 */
worker.addEventListener("fetch", async (event) => {
	const request = event.request;
	try {
		await onFetch(event);
	} catch (error) {
		console.log(`Error while trying to fetch '${request.url}'.`);
	}
});
