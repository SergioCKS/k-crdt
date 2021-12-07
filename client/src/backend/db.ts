/**
 * ## IndexedDb Interface
 *
 * Interface to IndexedDB.
 * @module
 */
import { generateId } from "./wasm/crdts";

/**
 * ## Type of the record
 *
 * Known record types. Each type corresponds to a specific
 */
export enum RecordType {
	HLC = "hlc",
	BoolRegister = "bool-register"
}

/**
 * ## DB Record
 *
 * Record stored in IndexedDB.
 */
export interface DbRecord {
	/**
	 * ### ID
	 *
	 * Unique identifier of the record.
	 *
	 * * Used as primary key in IndexedDB.
	 */
	id: string;

	/**
	 * ### Type
	 *
	 * Type of the record.
	 *
	 * * Used for deserializing the record into a specific type.
	 */
	type: RecordType;

	/**
	 * ### Value
	 *
	 * Binary encoding of the record.
	 *
	 * * The ArrayBuffer is supposed to be interpreted as a byte array (UInt8Array view).
	 */
	value: ArrayBuffer;

	/**
	 * ### Indices
	 *
	 * Object storing values used to index records.
	 *
	 * * A subset of the record values are placed here and referenced by IDB indices.
	 */
	indices?: Record<string, unknown>;
}

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
	public async initialize(): Promise<string> {
		// Check browser support.
		if (!worker.indexedDB) throw "Your browser doesn't support a stable version of IndexedDB.";

		//#region 1. Get DB name or generate a new one.
		// The name of the database has the format `KCRDT:{nodeID}`.
		const dbs = await worker.indexedDB.databases();
		const dbNames = dbs.map((dbInfo) => dbInfo.name || "");
		const crdtDbNames = dbNames.filter((dbName) => dbName.split(":")[0] === "KCRDT");

		if (crdtDbNames.length > 1)
			await Promise.all(crdtDbNames.map((dbName) => LocalDb.deleteDb(dbName)));

		const nodeId = crdtDbNames.length === 1 ? dbNames[0].substring(6) : generateId();
		//#endregion

		//2. Open database.
		await this.openDb(`KCRDT:${nodeId}`);

		// Setup generic error handler for errors that were not handled locally.
		this.db.onerror = (event) => console.error("Database error:", event);

		return nodeId;
	}

	/**
	 * ### DB interface is initialized?
	 *
	 * Whether or not the DB interface was initialized properly.
	 */
	public is_initialized(): boolean {
		return !!this.db;
	}

	/**
	 * ### Put DB record
	 *
	 * Adds or updates a database record in the `crdt` store.
	 *
	 * @param record Database record
	 * @returns DB key of the item
	 * @throws Errors encountered while trying to write to local database
	 */
	public putRecord(record: DbRecord): Promise<IDBValidKey> {
		return new Promise((resolve, reject) => {
			const request = this.db.transaction(["crdts"], "readwrite").objectStore("crdts").put(record);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * ### Get DB record
	 *
	 * Retrieves a database record from the `crdt` store.
	 *
	 * @param id ID of the record
	 * @returns Record or undefined if no matching record was found
	 * @throws Errors encountered while trying to retrieve record from the local database
	 */
	public getRecord(id: string): Promise<DbRecord | undefined> {
		return new Promise((resolve, reject) => {
			const request = this.db.transaction(["crdts"], "readonly").objectStore("crdts").get(id);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * ### Put CRDT
	 *
	 * Adds or updates a record in the `crdt` store.
	 *
	 * @param crdt Item to store
	 * @returns DB key of the stored item
	 */
	public async put_crdt(crdt: {
		id: string;
		value: any;
		encoded: Uint8Array;
		type: string;
	}): Promise<IDBValidKey> {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			const request = objectStore.put(crdt);
			const errorMsg = "Error wile attempting to write CRDT to local database.";
			request.onerror = () => reject(errorMsg);
			request.onsuccess = () => {
				if (request.result) {
					resolve(request.result);
				} else {
					reject(errorMsg);
				}
			};
		});
	}

	public async retrieveCrdts(): Promise<any[]> {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(["crdts"], "readonly");
			const objectStore = transaction.objectStore("crdts");
			const request = objectStore.getAll();
			request.onerror = () => {
				reject("Error while trying to retrieve CRDTs from local database.");
			};
			request.onsuccess = () => {
				if (request.result) {
					resolve(request.result);
				} else {
					resolve([]);
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
					// Uses "in-line" keys, i.e. keys are contained in values.
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
