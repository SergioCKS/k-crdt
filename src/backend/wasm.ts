/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { Engine, UID, test_clock, generate_id } from "./wasm/crdts";

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
	public engine: Engine = undefined;

	/**
	 * ### Initialize WASM
	 *
	 * Initialize WASM. Once initialized, WASM objects become interactive.
	 */
	public async initialize(): Promise<string> {
		await init();
		// Starts with a random node ID, which is replaced by a stored one later if found.
		this.engine = new Engine();
		return this.engine.get_node_id().as_string();
	}

	/**
	 * ### Set node ID
	 *
	 * Set the node ID for the WASM engine.
	 *
	 * @param nodeId - ID of the node in the system.
	 */
	public setNodeId(nodeId: string): void {
		if (this.engine) {
			this.engine.set_node_id(UID.from_string(nodeId));
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
}
