/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { Engine, generate_id, test_clock } from "../packages/pkg";

/**
 * ## WASM
 *
 * Class providing access to WASM objects and methods.
 */
export class Wasm {
	/**
	 * ### CRDT Engine
	 *
	 * Object containing all "live" CRDTs in WASM linear memory as well as methods for interacting with them.
	 */
	engine: Engine = undefined;

	/**
	 * ### Generate ID
	 *
	 * Generates a globally unique ID of 21 characters from the alphabet `A-Za-z0-9_-`.
	 *
	 * * Requires `initialize()` to have been called. Doesn't require `setNodeId()`.
	 *
	 * @returns Unique identifier.
	 */
	public generateId: () => string = undefined;

	public testClock: () => BigInt = undefined;

	/**
	 * ### Initialize WASM
	 *
	 * Initialize WASM. Once initialized, WASM objects become interactive.
	 */
	public async initialize(): Promise<void> {
		try {
			await init();
			this.generateId = generate_id;
			this.testClock = test_clock;
		} catch (exception) {
			console.log(exception);
		}
	}

	/**
	 * ### Set node ID
	 *
	 * Set the node ID for the WASM engine.
	 *
	 * @param nodeId - ID of the node in the system.
	 */
	public async setNodeId(nodeId: string): Promise<void> {
		this.engine = Engine.new(nodeId);
		if (this.engine) {
			this.engine.set_node_id(nodeId);
		}
	}
}
