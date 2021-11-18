const worker = self;

export class Storage {
	/**
	 * ### Initialize local database
	 *
	 * Initializes the IndexedDB CRDT database. Must be called before attempting to perform any request to the database.
	 *
	 * @returns ID of the Node in the system.
	 */
	async initialize() {
		if (!worker.indexedDB) {
			console.error("Your browser doesn't support a stable version of IndexedDB.");
			return;
		}
		const dbs = await worker.indexedDB.databases();
		console.log(dbs);
	}
}
