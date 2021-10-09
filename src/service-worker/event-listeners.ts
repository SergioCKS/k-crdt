/**
 * # Service Worker - Event Listeners
 *
 * Callback functions for handling the events throughout the service worker's lifecycle.
 *
 * Events:
 *
 * * `install`: Called on worker registration.
 * * `activate`: Called once the worker is active.
 * * `message`: Called on incoming messages from clients.
 */
import { build, files, timestamp } from "$service-worker";
import { wasm } from "./wasm";
import type { MsgData } from "./models";

const CACHE_KEY = `cache${timestamp}`;
const OFFLINE_KEY = `offline${timestamp}`;

/**
 * ## Fetch and Cache
 *
 * Attempts to fetch a request and places it on cache. If the request fails (client is offline), attempt to get response from cache.
 *
 * @param request - HTTP request
 * @returns HTTP Response
 */
async function fetchAndCache(request: Request): Promise<Response> {
	const cache = await caches.open(OFFLINE_KEY);

	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch (err) {
		const response = await cache.match(request);
		if (response) return response;

		throw err;
	}
}

/**
 * ## Service worker `install` event handler
 *
 * Service worker installation process that runs on service worker registration.
 *
 * * Caches static assets for offline support.
 * * TODO: Set up the local database (IndexedDB).
 */
export async function onInstall(): Promise<void> {
	//#region Cache static assets
	const cache = await caches.open(CACHE_KEY);
	await cache.addAll(build.concat(files));
	//#endregion
}

/**
 * ## Service worker `activate` event handler
 *
 * Service worker process that runs once the worker is active.
 *
 * * Clears old caches.
 */
export async function onActivate(): Promise<void> {
	//#region Clear old caches
	for (const key in await caches.keys()) {
		if (key !== CACHE_KEY) await caches.delete(key);
	}
	//#endregion
}

/**
 * ## Service worker `message` event handler
 *
 * Service worker process to handle incoming messages.
 *
 * @param client - The client sending the message.
 * @param data - The data attached to the message.
 */
export async function onMessage(client: Client, data: MsgData): Promise<void> {
	// Get node ID
	if (data.msgCode === "get-node-id") {
		const nodeId = wasm.engine.get_node_id();
		client.postMessage({
			msgCode: "node-id",
			payload: { nodeId }
		});
	}
}

/**
 * ## Service worker `fetch` event handler
 *
 * Intercepts outgoing `fetch` requests and fetches from cache if suitable.
 *
 * @param event - `fetch` event.
 */
export async function onFetch(event: FetchEvent): Promise<void> {
	if (event.request.method !== "GET" || event.request.headers.has("range")) return;
	const url = new URL(event.request.url);

	const isHttp = url.protocol.startsWith("http");
	const isDevServerRequest =
		url.hostname === self.location.hostname && url.port !== self.location.port;
	const staticAssets = new Set(build.concat(files));
	const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
	const skipBecauseUncached = event.request.cache === "only-if-cached" && !isStaticAsset;

	if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
		event.respondWith(
			(async () => {
				const cachedAsset = isStaticAsset && (await caches.match(event.request));
				return cachedAsset || fetchAndCache(event.request);
			})()
		);
	}
}
