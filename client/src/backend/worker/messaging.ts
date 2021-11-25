/**
 * # Web Worker - Messaging
 *
 * Handlers for incoming messages.
 *
 * * Handlers make use of component interfaces: WASM, LocalDB, SyncConnection.
 * @module
 */
import { Wasm } from "../wasm";
import { LocalDb, RecordType } from "../db";
import { SyncConnection } from "../sync";
import type { AppMessage, WorkerMessage } from "$types/messages";

/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

// Interface objects
let wasm: Wasm;
let localDb: LocalDb;
let syncConnection: SyncConnection;

//#region Messaging helper functions
/**
 * ## Broadcast message
 *
 * Broadcast a message to all connected clients.
 *
 * @param message - Message to broadcast to clients
 */
async function broadcastMessage(message: WorkerMessage) {
	const clients = await worker.clients.matchAll();
	clients.forEach((client) => client.postMessage(message));
}

/**
 * ## Message client
 *
 * Send a message to a specific connected client.
 *
 * @param client - Connected client
 * @param message - Message to send
 */
function messageClient(client: Client | MessagePort | ServiceWorker, message: WorkerMessage) {
	client.postMessage(message);
}
//#endregion

/**
 * ## Initialize interfaces
 *
 * Resets and initializes the interface objects (WASM, IndexedDB, and WebSocket connection).
 */
async function initializeInterfaces(forceRestart = false): Promise<void> {
	// 1. Renew interface objects
	wasm = new Wasm();
	localDb = new LocalDb();
	if (!syncConnection) {
		// syncConnection = new SyncConnection(new URL("wss://crdt.zeda.tech/ws"));
		syncConnection = new SyncConnection(new URL("wss://rust-wasm.zeda.workers.dev/ws"));
	}
	// 2. Initialize WASM
	let nid = await wasm.initialize();
	// 3. Open DB
	nid = await localDb.initialize(nid);
	// 4. Set node ID in WASM engine.
	wasm.setNodeId(nid);
	// 5. Restore clock from local database.
	try {
		const encoded = await localDb.getRecord("HLC");
		if (encoded) wasm.deserializeClock(encoded.value);
	} catch (error) {
		console.error(error);
	}
	// 6. Initialize connection to sync manager.
	try {
		await syncConnection.initialize(forceRestart);
	} catch (error) {
		console.log("Error connecting to server node. Device considered offline.", error);
	}
}

/**
 * ## Handle client message
 *
 * Handles an incoming message from a connected client or from the worker itself.
 *
 * @param client - The client (or worker) sending the message.
 * @param msgCode - Code of the message.
 * @param payload - Payload of the message.
 */
export async function handleClientMessage(
	client: Client | MessagePort | ServiceWorker,
	message: AppMessage
): Promise<boolean> {
	// Ensure the interfaces are initialized.
	const interfaces_initialized =
		wasm?.is_initialized() && localDb?.is_initialized() && syncConnection?.is_initialized();
	if (!interfaces_initialized) await initializeInterfaces();

	switch (message.msgCode) {
		case "initialize": {
			broadcastMessage({ msgCode: "initialized" });
			return true;
		}
		case "test": {
			syncConnection.messageServer({ msgCode: "test" });
			return true;
		}
		case "update-time-offset": {
			const newOffset = message.payload.value;

			wasm.setOffset(BigInt(Math.round(newOffset)));

			try {
				const encodedClock = wasm.serializeClock();
				localDb.putRecord({
					id: "HLC",
					type: RecordType.HLC,
					value: encodedClock
				});
			} catch (error) {
				console.error(error);
			}
			return true;
		}
		case "no-sync-connection": {
			// 2. Update offline values in client stores.
			broadcastMessage({
				msgCode: "offline-value",
				payload: { value: true }
			});
			return true;
		}
		case "create-bool-register": {
			// 1. Get register initial value from message.
			const value = message.payload.value;
			// 2. Create register and retrieve values.
			const register = wasm.createBoolRegister(value);
			const id = register.id.toString();
			const type = "bool";
			// 3. Broadcast the newly created register to the front-end clients.
			broadcastMessage({ msgCode: "new-register", payload: { id, value, type } });
			// 4. Persist encoded version in local database.
			try {
				await localDb.put_crdt({ id, value, encoded: register.getEncoded(), type });
			} catch (e) {
				console.error(e);
				return true;
			}
			// 5. Broadcast the event to other nodes.
			const updateMessage = register.getUpdateMessage(wasm.nid, wasm.generateTimeStamp());
			syncConnection.sendMessage(updateMessage);

			register.free();
			return true;
		}
		case "restore-registers": {
			try {
				const crdts = (await localDb.retrieveCrdts()) as {
					id: string;
					value: boolean;
					encoded: Uint8Array;
					type: string;
				}[];

				const crdts_obj: Record<string, unknown> = {};
				for (const crdt of crdts) {
					crdts_obj[crdt.id] = { value: crdt.value, type: crdt.type };
				}

				messageClient(client, {
					msgCode: "restored-registers",
					payload: { value: crdts_obj }
				});
			} catch (e) {
				console.error(e);
			}
			return true;
		}
	}
}
