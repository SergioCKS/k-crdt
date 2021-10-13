/**
 * ## IndexedDb Interface
 *
 * Interface to IndexedDB.
 * @module
 */
import type { Wasm } from "./wasm";

/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

//#region IndexedDB async wrappers
/**
 * ## Open Database
 *
 * Opens the CRDT IndexedDB database.
 *
 * * Async wrapper that resolves on success or failure of the operation.
 * * Handles schema changes on version upgrades.
 *
 * @param dbName - Database name
 * @returns IndexDB Database
 */
async function openDb(dbName: string): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const dbOpenRequest = worker.indexedDB.open(dbName);
		dbOpenRequest.onerror = () => {
			reject("Error while attempting to open the local database.");
		};
		dbOpenRequest.onupgradeneeded = (event) => {
			const request = event.target as IDBOpenDBRequest;
			const db = request.result;

			if (db.version === 1) {
				db.createObjectStore("crdts", { keyPath: "id" });
			}
		};
		dbOpenRequest.onsuccess = () => {
			resolve(dbOpenRequest.result);
		};
	});
}

/**
 * ## Delete Database
 *
 * Delete the IndexedDB database with a given name.
 *
 * * Async wrapper that resolves on success or failure of the operation.
 *
 * @param dbName - Database name
 */
async function deleteDb(dbName: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const dbDeleteRequest = worker.indexedDB.deleteDatabase(dbName);
		dbDeleteRequest.onerror = () => {
			reject("Error while attempting to delete a database.");
		};
		dbDeleteRequest.onsuccess = () => {
			resolve();
		};
	});
}
//#endregion

/**
 * ## Local Database
 *
 * Class providing streamlined access to the CRDT IndexedDB database.
 */
export class LocalDb {
	/**
	 * ### Database
	 *
	 * IndexedDB CRDT database.
	 *
	 * * Accessible after successful opening.
	 */
	db: IDBDatabase = undefined;

	/**
	 * ## Initialize local database
	 *
	 * Initializes the IndexedDB CRDT database. Must be called before attempting to perform any request to the database.
	 *
	 * @returns ID of the Node in the system.
	 */
	async initialize(wasm: Wasm): Promise<string> {
		// Check browser support.
		if (!worker.indexedDB) {
			console.error("Your browser doesn't support a stable version of IndexedDB.");
			return;
		}

		//#region 1. Get DB name or generate a new one.
		// The name of the database has the format `KCRDT:{nodeID}`.
		const dbs = await worker.indexedDB.databases();
		const dbNames = dbs.map((dbInfo) => dbInfo.name || "");
		const crdtDbNames = dbNames.filter((dbName) => dbName.split(":")[0] === "KCRDT");

		let nodeId: string;
		switch (crdtDbNames.length) {
			case 0:
				nodeId = wasm.generateId();
				break;
			case 1:
				nodeId = dbNames[0].substring(6);
				break;
			default:
				Promise.all(crdtDbNames.map((dbName) => deleteDb(dbName)));
				return;
		}
		//#endregion

		//#region 2. Open database.
		try {
			this.db = await openDb(`KCRDT:${nodeId}`);
		} catch (exception) {
			console.log(exception);
			return;
		}
		//#endregion

		// Setup generic error handler for errors that were not handled locally and bubbled all the way up to the database object.
		this.db.onerror = (event) => {
			console.error("Database error:", event);
		};

		return nodeId;
	}
}
