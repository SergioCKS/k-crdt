/**
 * ## IndexedDb Interface
 *
 * Interface to IndexedDB.
 * @module
 */

/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

//#region Types
/**
 * ## Available store
 *
 * IndexedDB store available for usage after initialization.
 */
type AvailableStore = "node" | "records" | "fields";

/**
 * ## IDB record
 *
 * Base IndexedDB record type.
 */
interface IDBRecord {
	/**
	 * ### ID
	 *
	 * Unique identifier of the record.
	 *
	 * * Used as primary key in IndexedDB.
	 */
	id: string;
}

/**
 * ## Node metadata record
 */
export interface NodeRecord extends IDBRecord {
	id: "NID" | "HLC";
	/**
	 * ### Value
	 *
	 * Binary encoding of the record.
	 *
	 * * The ArrayBuffer is supposed to be interpreted as a byte array (UInt8Array view).
	 */
	value: ArrayBuffer;
}

/**
 * ## Type of the record
 *
 * Known record types. Each type corresponds to a specific
 */
export enum RecordType {
	UID = "uid",
	HLC = "hlc",
	BoolRegister = "bool-register"
}

/**
 * ## Collection record
 *
 * Collection record.
 */
export interface CRecord extends IDBRecord {
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
 * ## Field record.
 *
 * Field IDB record.
 */
export interface FieldRecord extends IDBRecord {
	/**
	 * ### Order
	 *
	 * Node-specific order of the field.
	 */
	order: number;

	/**
	 * ### Size
	 *
	 * Size (in bytes) of the value block for records implementing the field.
	 */
	size: number;
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
	public db: IDBDatabase = undefined;

	/**
	 * ### Initialize local database
	 *
	 * Initializes the IndexedDB CRDT database. Must be called before attempting to perform any request to the database.
	 *
	 * @returns ID of the Node in the system.
	 */
	public initialize(): Promise<void> {
		return new Promise((resolve, reject) => {
			// 1. Check browser support.
			if (!worker.indexedDB) reject("Your browser doesn't support a stable version of IndexedDB.");

			// 2. Open database.
			const dbOpenRequest = worker.indexedDB.open("KCRDT");
			dbOpenRequest.onerror = () => {
				reject("Error while attempting to open the local database.");
			};
			dbOpenRequest.onupgradeneeded = (event) => {
				const request = event.target as IDBOpenDBRequest;
				const db = request.result;

				if (db.version === 1) {
					// Uses "in-line" keys, i.e. keys are contained in values.
					db.createObjectStore("node", { keyPath: "id" });
					db.createObjectStore("records", { keyPath: "id" });
					db.createObjectStore("fields", { keyPath: "id" });
				}
			};
			dbOpenRequest.onsuccess = () => {
				this.db = dbOpenRequest.result;
				// Setup generic error handler for errors that were not handled locally.
				this.db.onerror = (event) => console.error("Database error:", event);
				resolve();
			};
		});
	}

	/**
	 * ### DB interface is initialized?
	 *
	 * Whether or not the DB interface was initialized properly.
	 */
	public is_initialized(): boolean {
		return !!this.db;
	}

	//#region Generic IDB getter/setter
	/**
	 * ### Put IDB record
	 *
	 * Adds or updates an IndexedDB record.
	 *
	 * @param store - Name of the IndexedDB store containing the record
	 * @param record - IndexedDB record
	 * @returns DB key of the item
	 * @throws Errors encountered while trying to write to local database
	 */
	private putIDBRecord(store: AvailableStore, record: IDBRecord): Promise<IDBValidKey> {
		return new Promise((resolve, reject) => {
			const request = this.db.transaction([store], "readwrite").objectStore(store).put(record);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * ### Get IDB record
	 *
	 * Retrieves an IndexedDB record.
	 *
	 * @param store - Name of the IndexedDB store containing the record
	 * @param id - Key of the record
	 * @returns IndexedDB record or undefined if not found
	 * @throws Errors encountered while trying to read the local database
	 */
	private getIDBRecord(store: AvailableStore, id: string): Promise<IDBRecord | undefined> {
		return new Promise((resolve, reject) => {
			const request = this.db.transaction([store], "readonly").objectStore(store).get(id);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}
	//#endregion

	//#region Record getters
	/**
	 * ### Get node record
	 *
	 * Retrieves an IndexedDB record from the `node` store.
	 *
	 * @param id ID of the record
	 * @returns Record or undefined if no matching record was found
	 * @throws Errors encountered while trying to retrieve record from the local database
	 */
	public getNodeRecord(id: string): Promise<NodeRecord | undefined> {
		return this.getIDBRecord("node", id) as Promise<NodeRecord | undefined>;
	}

	/**
	 * ### Get DB record
	 *
	 * Retrieves an IndexedDB record from the `records` store.
	 *
	 * @param id ID of the record
	 * @returns Record or undefined if no matching record was found
	 * @throws Errors encountered while trying to retrieve record from the local database
	 */
	public getRecord(id: string): Promise<CRecord | undefined> {
		return this.getIDBRecord("records", id) as Promise<CRecord | undefined>;
	}

	/**
	 * ### Get field record
	 *
	 * Retrieves an IndexedDB record from the `fields` store.
	 *
	 * @param id ID of the record
	 * @returns Record or undefined if no matching record was found
	 * @throws Errors encountered while trying to retrieve record from the local database
	 */
	public getFieldRecord(id: string): Promise<FieldRecord | undefined> {
		return this.getIDBRecord("fields", id) as Promise<FieldRecord | undefined>;
	}
	//#endregion

	//#region Record Setters
	/**
	 * ### Put Node record
	 *
	 * Adds or updates a node metadata record in the `node` IDB store.
	 *
	 * @param record - Node record
	 * @returns - DB key of the item
	 * @throws Errors encountered while trying to write to local database
	 */
	public putNodeRecord(record: NodeRecord): Promise<IDBValidKey> {
		return this.putIDBRecord("node", record);
	}

	/**
	 * ### Put DB record
	 *
	 * Adds or updates a collection record in the `records` IDB store.
	 *
	 * @param record - Collection record
	 * @returns - DB key of the item
	 * @throws Errors encountered while trying to write to local database
	 */
	public putRecord(record: CRecord): Promise<IDBValidKey> {
		return this.putIDBRecord("records", record);
	}

	/**
	 * ### Put field record
	 *
	 * Adds or updates a field record in the `field` IDB store.
	 *
	 * @param record - Field record
	 * @returns - DB key of the item
	 * @throws Errors encountered while trying to write to local database
	 */
	public putFieldRecord(record: FieldRecord): Promise<IDBValidKey> {
		return this.putIDBRecord("fields", record);
	}
	//#endregion

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
