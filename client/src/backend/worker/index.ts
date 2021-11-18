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
import { onMessage } from "./messaging";
import type { ClientMsgData } from "./messaging";

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
 * Adds te `message` event listener and handles exceptions.
 */
worker.addEventListener("message", async (event) => {
	const client = event.source as Client;
	const msgData = event.data as ClientMsgData;
	try {
		await onMessage(client, msgData);
	} catch (error) {
		console.error(`Error while handling '${msgData.msgCode}'' message! Error:`, error);
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
