import init, { Engine } from "../packages/pkg/crdts";

class Wasm {
	engine: Engine;

	constructor() {
		init().then(() => {
			this.engine = Engine.new("some-node-id");
		});
	}
}

export const wasm = new Wasm();
