import { build, files, timestamp } from "$service-worker";
import init, { generate_id } from "../packages/pkg/crdts";
import { NodeDatabase } from "../models/nodedb";
import Dexie from "dexie";

const FILES = `cache${timestamp}`;
const to_cache = build.concat(files);

export async function swOnInstall(): Promise<void> {
	const nodeDbExists = await Dexie.exists("NodeDatabase");

	//#region Install NodeDB
	if (!nodeDbExists) {
		// Generate node ID
		await init();
		const nodeId = generate_id();

		// Initialize local DB
		const nodeDb = new NodeDatabase();
		await nodeDb.meta.put({
			nid: nodeId,
			installed: Date.now().toString(),
			updated: Date.now().toString()
		});
	}
	//#endregion

	//#region Cache files
	const cache = await caches.open(FILES);
	await cache.addAll(to_cache);
	//#endregion
}

export async function swOnActivate(): Promise<void> {
	// Delete old caches
	const keys = await caches.keys();
	for (const key of keys) {
		if (key !== FILES) await caches.delete(key);
	}
}
