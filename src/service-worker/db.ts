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
	public db: IDBDatabase = undefined;

	/**
	 * ### Initialize local database
	 *
	 * Initializes the IndexedDB CRDT database. Must be called before attempting to perform any request to the database.
	 *
	 * @returns ID of the Node in the system.
	 */
	public async initialize(wasm: Wasm): Promise<string> {
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
				Promise.all(crdtDbNames.map((dbName) => LocalDb.deleteDb(dbName)));
				nodeId = wasm.generateId();
		}
		//#endregion

		//#region 2. Open database.
		try {
			await this.openDb(`KCRDT:${nodeId}`);
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

	/**
	 * ### Retrieve counter state
	 *
	 * Retrieves the serialized state of the counter from the database.
	 *
	 * @returns State of the counter if found.
	 */
	public async retrieveState(): Promise<string | null> {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(["crdts"], "readonly");
			const objectStore = transaction.objectStore("crdts");
			const request = objectStore.get("counter");
			request.onerror = () => {
				reject("Error while attempting to retrieve the state of the counter.");
			};
			request.onsuccess = () => {
				if (request.result) {
					resolve(request.result.state);
				} else {
					resolve(null);
				}
			};
		});
	}

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
	private async openDb(dbName: string): Promise<void> {
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
				this.db = dbOpenRequest.result;
				resolve();
			};
		});
	}

	/**
	 * ### Delete Database
	 *
	 * Delete the IndexedDB database with a given name.
	 *
	 * * Async wrapper that resolves on success or failure of the operation.
	 *
	 * @param dbName - Database name
	 */
	public static async deleteDb(dbName: string): Promise<void> {
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
}
