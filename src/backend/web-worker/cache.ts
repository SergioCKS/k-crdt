/**
 * # Web Worker - Cache
 *
 * Methods used to implement the cache strategy of the web worker.
 *
 * * During worker installation, the base application files are cached.
 * * During worker activation, old files are cleared.
 * * When a specific resource is fetched and satisfies some criteria, it is placed in cache.
 * * When a fetch request fails (presumably offline), attempt to fetch from cache.
 * * Base files are fetched from cache.
 *
 * @module
 */

import { timestamp, files, build } from "$service-worker";

//#region Cache keys
/**
 * ## Base cache key
 *
 * Key of the cache used to store base application files during worker installation.
 */
const BASE_KEY = `base${timestamp}`;

/**
 * ## Specific cache key
 *
 * Key of the cache used to store specific resources fetched.
 */
const SPEC_KEY = `spec${timestamp}`;
//#endregion

/**
 * ## Cache base files
 *
 * Cache necessary build and static files for the application to run.
 */
export async function cacheBaseFiles(): Promise<void> {
	const cache = await caches.open(BASE_KEY);
	await cache.addAll(build.concat(files));
}

/**
 * ## Clear old files
 *
 * Clears files from cache that have an older timestamp.
 */
export async function clearOldFiles(): Promise<void> {
	for (const key in await caches.keys()) {
		if (key !== BASE_KEY) await caches.delete(key);
	}
}

/**
 * ## Fetch and cache
 *
 * Attempts to fetch a request and places it on cache for offline use. If the request fails (client is offline), attempt to get response from cache.
 *
 * @param request - HTTP request
 * @returns HTTP Response
 */
async function fetchAndCache(request: Request): Promise<Response> {
	const cache = await caches.open(SPEC_KEY);
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
 * ## Service worker `fetch` event handler
 *
 * Intercepts outgoing `fetch` requests and fetches from cache if suitable.
 *
 * @param event - `fetch` event.
 */
export async function onFetch(event: FetchEvent): Promise<void> {
	const url = new URL(event.request.url);

	// Ignore protocols other than HTTP.
	if (!url.protocol.startsWith("http")) return;

	// Ignore methods other than GET.
	if (event.request.method !== "GET") return;

	// Ignore if specified by request using `Range` header.
	if (event.request.headers.has("range")) return;

	// Ignore if using development server.
	const isDevServerRequest =
		url.hostname === self.location.hostname && url.port !== self.location.port;
	if (isDevServerRequest) return;

	const baseFiles = new Set(build.concat(files));
	const isBaseFile = url.host === self.location.host && baseFiles.has(url.pathname);

	// Ignore if file can only be retrieved from cache, but is not a base file.
	const skipBecauseUncached = event.request.cache === "only-if-cached" && !isBaseFile;
	if (skipBecauseUncached) return;

	// Intercept request.
	event.respondWith(
		(async () => {
			// Check in base cached files.
			const cachedAsset = isBaseFile && (await caches.match(event.request));
			if (cachedAsset) return cachedAsset;

			// Fetch specific (cached if offline) and cache if available.
			return fetchAndCache(event.request);
		})()
	);
}
