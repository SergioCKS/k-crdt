/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { Engine, generate_id } from "../packages/pkg/crdts";

/**
 * ## WASM
 *
 * Class providing access to WASM objects and methods.
 */
class Wasm {
	/**
	 * ### CRDT Engine
	 *
	 * Object containing all "live" CRDTs in WASM linear memory as well as methods for interacting with them.
	 */
	engine: Engine = undefined;

	/**
	 * ### Status
	 *
	 * Status of the interface.
	 *
	 * * `active`: WASM was initialized properly and objects in memory are interacted.
	 * * `inactive`: WASM was not initialized yet. WASM objects do not exist in memory and trying to interact with them will throw exceptions.
	 */
	status: "active" | "inactive" = "inactive";

	/**
	 * ### Initialize WASM
	 *
	 * Initialize WASM. Once initialized, WASM objects become interactive.
	 */
	public async initialize() {
		try {
			await init();
		} catch (exception) {
			console.log(exception);
		}
	}

	/**
	 * ### Start CRDT engine
	 *
	 * Starts the CRDT engine object.
	 *
	 * * Requires `initialize()` to have been called.
	 */
	public startEngine(nodeId: string) {
		try {
			this.engine = Engine.new(nodeId);
			this.status = "active";
		} catch (exception) {
			console.log(exception);
		}
	}

	/**
	 * ### Generate ID
	 *
	 * Generates a globally unique ID of 21 characters from the alphabet `A-Za-z0-9_-`.
	 *
	 * * Requires `initialize()` to have been called. Doesn't require `startEngine()` to have been called.
	 *
	 * @returns Unique identifier.
	 */
	public generateId(): string {
		return generate_id();
	}
}

export const wasm = new Wasm();
