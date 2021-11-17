const worker = self;

export class Storage {
    constructor() {
        self._db = undefined;
    }

    async initialize() {
        if (!worker.indexedDB) {
            console.error("Your browser doesn't support a stable version of IndexedDB.");
            return;
        }
        const dbs = await worker.indexedDB.databases();
        console.log(dbs);
    }
}
