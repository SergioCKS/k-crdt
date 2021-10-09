/**
 * # Service Worker Script
 *
 * Service worker registration script.
 *
 * * Adds event listeners (`install`, `activate`, `message`)
 */
import { onInstall, onActivate, onMessage, onFetch } from "./event-listeners";
import type { MsgData } from "./models";

/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

//#region Setup SW event listeners
/**
 * ## Add `install` event listener
 *
 * Adds the `install` event handler and indicates when the process is running/finished.
 */
worker.addEventListener("install", (event) => {
	event.waitUntil(
		onInstall().then(() => {
			worker.skipWaiting();
		})
	);
});

/**
 * ## Add `activate` event listener
 *
 * Adds the `activate` event handler and indicates when the process is running. Once the process is finished, the new worker overrides the previous one.
 */
worker.addEventListener("activate", (event) => {
	event.waitUntil(
		onActivate().then(() => {
			worker.clients.claim();
		})
	);
});

/**
 * ## Add `message` event listener
 *
 * Adds te `message` event listener and handles exceptions.
 */
worker.addEventListener("message", async (event) => {
	const client = event.source as Client;
	const msgData = event.data as MsgData;
	try {
		await onMessage(client, msgData);
	} catch (error) {
		console.log(`Error while handling '${msgData.msgCode}'' message!`);
	}
});

/**
 * ## Add `fetch` event listener
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
//#endregion
