/** @module
 * # WASM Interface
 *
 * Interface to objects and methods from WASM linear memory.
 */
import init, { UID, BrowserHLC, Timestamp, createBoolRegister } from "./wasm/crdts";

/**
 * ## WASM
 *
 * Class providing access to WASM objects and methods.
 */
export class Wasm {
	/**
	 * ### Node ID
	 *
	 * Unique ID of the node in the system.
	 */
	public nid: UID | undefined = undefined;

	/**
	 * ### Hybrid logical clock
	 *
	 * HLC based on browser time. It is persisted in the local database when updated and restored from it on initialization.
	 */
	public hlc: BrowserHLC | undefined = undefined;

	//#region Initialization
	/**
	 * ### Initialize
	 *
	 * Initialize Wasm interface.
	 */
	public async initialize(): Promise<void> {
		// Initialize Wasm instance. Once initialized, Wasm objects are available.
		await init();
	}

	/**
	 * ### WASM is initialized?
	 *
	 * Whether or not the WASM interface is initialized.
	 */
	public is_initialized(): boolean {
		return !!this.nid && !!this.hlc;
	}

	/**
	 * ### Deserialize node ID
	 *
	 * Set the node ID for the WASM engine.
	 *
	 * @param encoded - ID of the node in the system in binary format.
	 */
	public deserializeNodeId(encoded: Uint8Array): void {
		this.nid = UID.deserialize(encoded);
	}

	/**
	 * ### Initialize node ID
	 *
	 * Initializes the node ID as a new random UID.
	 */
	public initializeNodeId(): void {
		this.nid = new UID();
	}
	//#endregion

	//#region Clock
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

	/**
	 * ### Initialize clock
	 *
	 * Initializes the local clock in a default state.
	 */
	public initializeClock(): void {
		this.hlc = new BrowserHLC();
	}

	/**
	 * ### Generate timestamp
	 *
	 * Generates a timestamp polling the browser time and updating the state of the HLC.
	 *
	 * @returns Generated timestamp
	 * @throws Any error encountered while polling the browser time or updating the HLC.
	 */
	public generateTimestamp(): Timestamp {
		return this.hlc?.generateTimestamp();
	}

	/**
	 * ### Update with timestamp
	 *
	 * Updates the HLC with a message timestamp.
	 *
	 * @param ts Message timestamp
	 * @throws If the message timestamp drifts too much into the future.
	 */
	public updateWithTimestamp(ts: Timestamp): void {
		this.hlc?.updateWithTimestamp(ts);
	}
	//#endregion

	/**
	 * ### Generate ID
	 *
	 * Generates a globally unique ID.
	 *
	 * @returns Unique ID
	 */
	public generateId(): UID {
		return new UID();
	}

	/**
	 * ### Create bool register
	 *
	 * Creates a new last-write-wins register over a boolean value.
	 *
	 * @param initialValue Initial value of the register
	 * @returns Encoded register
	 */
	public createBoolRegister(initialValue: boolean): Uint8Array {
		return createBoolRegister(this.generateTimestamp(), initialValue);
	}

	public deserializeTimestamp(encoded: Uint8Array): Timestamp {
		return Timestamp.deserialize(encoded);
	}

	public deserializeUid(encoded: Uint8Array): UID {
		return UID.deserialize(encoded);
	}
}
