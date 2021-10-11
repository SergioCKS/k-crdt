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
 * * `fetch`: Intercepts outgoing HTTP requests.
 */
import { build, files, timestamp } from "$service-worker";
import { Wasm } from "./wasm";
import { LocalDb } from "./db";
import type { ClientMsgData, SwMsgData } from "./models";

/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

//#region Interface objects
let wasm: Wasm;
let db: LocalDb;
//#endregion

//#region Cache keys
const CACHE_KEY = `cache${timestamp}`;
const OFFLINE_KEY = `offline${timestamp}`;
//#endregion

//#region Helper functions
/**
 * ## Fetch and cache
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
 * ## Initialize interfaces
 *
 * Resets and initializes the interface objects (WASM & IndexedDB). Steps:
 *
 * 1. Renew the interface objects.
 * 2. Initialize WASM module.
 * 3. Open local database.
 * 4. Start the CRDT engine.
 */
async function initializeInterfaces(): Promise<void> {
	// 1. Renew interface objects
	wasm = new Wasm();
	db = new LocalDb();

	// 2. Initialize WASM
	await wasm.initialize();

	//#region 3. Open DB
	const nodeId = await db.initialize(wasm);

	if (db.status === "inactive" || !nodeId) {
		console.log("Failed to open IndexedDB. Aborting installation.");
		return;
	}
	if (db.status === "active") {
		console.log("LocalDB opened.");
	}
	//#endregion

	//#region 4. Start CRDT engine.
	await wasm.startEngine(nodeId);

	if (wasm.status === "active") {
		console.log("WASM engine started.");
	}
	//#endregion
}
//#endregion

//#region Event listeners
/**
 * ## Service worker `install` event handler
 *
 * Service worker installation process that runs on service worker registration.
 *
 * * Caches static assets for offline support.
 * * TODO: Set up the local database (IndexedDB).
 */
export async function onInstall(): Promise<void> {
	// await initializeInterfaces();
	// 1. Renew interface objects
	wasm = new Wasm();
	db = new LocalDb();

	// 2. Initialize WASM
	await wasm.initialize();

	//#region 3. Open DB
	const nodeId = await db.initialize(wasm);

	if (db.status === "inactive" || !nodeId) {
		console.log("Failed to open IndexedDB. Aborting installation.");
		return;
	}
	if (db.status === "active") {
		console.log("LocalDB opened.");
	}
	//#endregion

	//#region Cache static assets
	const cache = await caches.open(CACHE_KEY);
	await cache.addAll(build.concat(files));
	console.log("Static assets cached.");
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
export async function onMessage(client: Client, data: ClientMsgData): Promise<void> {
	const clients = await worker.clients.matchAll();
	// Initialize
	if (data.msgCode === "initialize") {
		await initializeInterfaces();
		const msgData: SwMsgData = { msgCode: "initialized" };
		clients.forEach((client) => client.postMessage(msgData));
	}
	// Get node ID
	if (data.msgCode === "get-node-id") {
		const nodeId = wasm.engine.get_node_id();
		const msgData: SwMsgData = {
			msgCode: "node-id",
			payload: { nodeId }
		};
		client.postMessage(msgData);
	}
	// Get counter value
	if (data.msgCode === "get-gcounter-value") {
		const value = wasm.engine.get_counter_value();
		const msgData: SwMsgData = {
			msgCode: "counter-value",
			payload: { value }
		};
		client.postMessage(msgData);
	}
	// Increment counter
	if (data.msgCode === "increment-gcounter") {
		wasm.engine.increment_counter();
		const value = wasm.engine.get_counter_value();
		const msgData: SwMsgData = {
			msgCode: "counter-value",
			payload: { value }
		};
		clients.forEach((client) => client.postMessage(msgData));
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
//#endregion
