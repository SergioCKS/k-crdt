/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { Engine, UID, test_clock } from "../backend/wasm/crdts";

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
			this.generateId = () => {
				return new UID().toString();
			};
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
	public setNodeId(nodeId: string): void {
		this.engine = Engine.new(nodeId);
		if (this.engine) {
			this.engine.set_node_id(nodeId);
		}
	}

	/**
	 * ### Set time offset
	 *
	 * Set the time offset for the WASM engine.
	 *
	 * @param offset - Offset in milliseconds.
	 */
	public setOffset(offset: number): void {
		if (this.engine) {
			this.engine.set_time_offset(offset);
		}
	}

	/**
	 * ### Generate timestamp
	 *
	 * Generates an (offsetted) HLC timestamp.
	 */
	public generateTimestamp(): string | void {
		if (this.engine) {
			return this.engine.generate_timestamp();
		}
	}
}
