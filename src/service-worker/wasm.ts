import init, { GCounter } from "../packages/pkg/crdts";

class Wasm {
	state: GCounter;

	constructor() {
		init().then(() => {
			this.state = GCounter.init("a");
		});
	}
}

export const wasm = new Wasm();
