import Dexie from "dexie";

interface IMeta {
	nid: string;
	installed: string;
	updated: string;
}

export class NodeDatabase extends Dexie {
	meta: Dexie.Table<IMeta, number>;

	constructor() {
		super("NodeDatabase");
		this.version(1).stores({
			meta: "nid, installed, updated"
		});
	}
}
