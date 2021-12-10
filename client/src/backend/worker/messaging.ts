/**
 * # Web Worker - Messaging
 *
 * Handlers for incoming messages.
 *
 * * Handlers make use of component interfaces: WASM, LocalDB, SyncConnection.
 * @module
 */
import { Wasm } from "../wasm";
import { LocalDb } from "../db";
import { SyncConnection } from "../sync";
import type { AppMessage, WorkerMessage } from "$types/messages";
// import { buildClientBinaryMessage } from "$types/messages";

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
	if (!syncConnection) syncConnection = new SyncConnection(new URL("wss://crdt.zeda.tech/ws"));
	// 2. Initialize WASM
	await wasm.initialize();
	// 3. Open DB
	await localDb.initialize();
	// 4. Restore node ID from local database or generate a new one.
	const nidRecord = await localDb.getNodeRecord("NID");
	let encodedId: Uint8Array;
	if (nidRecord) {
		encodedId = new Uint8Array(nidRecord.value);
		wasm.deserializeNodeId(encodedId);
	} else {
		wasm.initializeNodeId();
		encodedId = wasm.nid.serialize();
		localDb.putNodeRecord({ id: "NID", value: encodedId.buffer });
	}
	// 5. Restore clock from local database or initialize it in a default state.
	const encoded = await localDb.getNodeRecord("HLC");
	if (encoded) {
		wasm.deserializeClock(encoded.value);
	} else {
		wasm.initializeClock();
	}
	// 6. Initialize connection to sync manager.
	await syncConnection.initialize(forceRestart, encodedId);
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
			// syncConnection.messageServer({ msgCode: "test" });
			console.log(wasm.generateTimestamp().toString(), wasm.getOffset().toString());
			return true;
		}
		case "update-time-offset": {
			const newOffset = message.payload.value;

			wasm.setOffset(BigInt(Math.round(newOffset)));

			const encodedClock = wasm.serializeClock();
			localDb.putNodeRecord({ id: "HLC", value: encodedClock });
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
		//#region create-bool-register
		// case "create-bool-register": {
		// 	// 1. Get register initial value from message.
		// 	const value = message.payload.value;

		// 	// 2. Create register and retrieve values.
		// 	const encoded = wasm.createBoolRegister(value);
		// 	const uid = wasm.generateId();
		// 	const id = uid.toString();
		// 	const type = "bool";

		// 	// 3. Broadcast the newly created register to the front-end clients.
		// 	broadcastMessage({ msgCode: "new-register", payload: { id, value, type } });

		// 	// 4. Persist encoded version in local database.
		// 	try {
		// 		await localDb.put_crdt({ id, value, encoded, type });
		// 	} catch (e) {
		// 		console.error(e);
		// 		return true;
		// 	}

		// 	// 5. Broadcast the event to other nodes.
		// 	const binMessage = buildClientBinaryMessage({
		// 		msgCode: "bool-register",
		// 		components: {
		// 			ts: wasm.generateTimestamp().serialize(),
		// 			id: uid.serialize(),
		// 			register: encoded
		// 		}
		// 	});
		// 	syncConnection.sendMessage(binMessage);
		// 	return true;
		// }
		//#endregion
		// case "restore-registers": {
		// 	try {
		// 		const crdts = (await localDb.retrieveCrdts()) as {
		// 			id: string;
		// 			value: boolean;
		// 			encoded: Uint8Array;
		// 			type: string;
		// 		}[];

		// 		const crdts_obj: Record<string, unknown> = {};
		// 		for (const crdt of crdts) {
		// 			crdts_obj[crdt.id] = { value: crdt.value, type: crdt.type };
		// 		}

		// 		messageClient(client, {
		// 			msgCode: "restored-registers",
		// 			payload: { value: crdts_obj }
		// 		});
		// 	} catch (e) {
		// 		console.error(e);
		// 	}
		// 	return true;
		// }
		case "update-bool-register": {
			const { ts } = message.payload;

			//#region Update HLC
			const message_ts = wasm.deserializeTimestamp(ts);
			try {
				wasm.updateWithTimestamp(message_ts);
			} catch {
				console.error("Failed to update HLC.");
				return true;
			}
			//#endregion

			console.log(wasm.generateTimestamp().toString());
			return true;
		}
	}
}
