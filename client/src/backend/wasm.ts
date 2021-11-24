/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { Engine, UID, BrowserHLC } from "./wasm/crdts";

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
	 * ### Hybrid logical clock
	 *
	 * HLC based on browser time. It is persisted in the local database when updated and restored from it on initialization.
	 */
	public hlc: BrowserHLC = undefined;

	/**
	 * ### Initialize WASM
	 *
	 * Initialize WASM. Once initialized, WASM objects become interactive.
	 */
	public async initialize(): Promise<string> {
		await init();
		// Starts with a random node ID, which is replaced by a stored one later if found.
		this.engine = new Engine();

		// Starts with a default state, which is replaced by a stored one later if found.
		this.hlc = new BrowserHLC();

		return this.engine.get_node_id().as_string();
	}

	/**
	 * ### WASM is initialized?
	 *
	 * Whether or not the WASM interface is initialized.
	 */
	public is_initialized(): boolean {
		return !!this.engine && !!this.hlc;
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

	//#region Time offset
	/**
	 * ### Get clock offset
	 *
	 * Returns the time offset of the local HLC.
	 *
	 * @returns Offset in milliseconds
	 */
	public getOffset(): BigInt {
		return this.hlc ? this.hlc.getOffset() : BigInt(0);
	}

	/**
	 * ### Set clock offset
	 *
	 * Updates the time offset of the local HLC.
	 *
	 * @param offset - Offset in milliseconds
	 */
	public setOffset(offset: BigInt): void {
		if (this.hlc) this.hlc.setOffset(offset);
	}
	//#endregion

	/**
	 * ### Serialize clock
	 *
	 * Returns the serialized current state of the HLC.
	 *
	 * @returns Encoded HLC
	 * @throws Error if the serialization fails, or if the clock wasn't serialized properly.
	 */
	public serializeClock(): ArrayBuffer {
		return this.hlc.serialize().buffer;
	}

	/**
	 * ### Deserialize clock
	 *
	 * Updates the HLC with an encoded version.
	 *
	 * @param encoded Encoded version of the HLC
	 * @throws Error if deserialization fails.
	 */
	public deserializeClock(encoded: ArrayBuffer): void {
		this.hlc = BrowserHLC.deserialize(new Uint8Array(encoded));
	}
}
