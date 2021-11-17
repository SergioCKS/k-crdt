/**
 * # Web Worker - Messaging
 *
 * Handlers for incoming messages.
 *
 * * Handlers make use of other component interfaces: WASM, LocalDB, SyncConnection.
 * @module
 */
import { Wasm } from "../wasm";
import { LocalDb } from "../db";
import { SyncConnection } from "../sync";

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

//#region Types
export interface MsgData {
	msgCode: string;
	payload?: Record<string, unknown>;
}

export interface ClientMsgData extends MsgData {
	msgCode:
		| "create-gcounter"
		| "get-gcounter-value"
		| "get-node-id"
		| "increment-counter"
		| "decrement-counter"
		| "toggle-register"
		| "test-clock"
		| "initialize"
		| "incoming-update"
		| "incoming-register-update"
		| "update-time-offset"
		| "no-sync-connection";
}

export interface SwMsgData extends MsgData {
	msgCode:
		| "initialized"
		| "node-id"
		| "counter-value"
		| "register-value"
		| "time-offset-value"
		| "offline-value"
		| "retrieve-time-offset"
		| "error";
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
	await wasm.initialize();

	// 3. Open DB
	const nodeId = await localDb.initialize(wasm);

	// 4. Set node ID in WASM engine.
	wasm.setNodeId(nodeId);

	//#region 5. Recover state from local storage.
	let counterState: string | null;
	try {
		counterState = await localDb.retrieveState();
	} catch (exception) {
		console.error(exception);
		return;
	}
	//#endregion

	// 6. Restore counter from serialized state.
	// wasm.engine.restore_state(counterState);

	// 7. Initialize connection to sync manager.
	syncConnection.initialize(forceRestart);
}

/**
 * ## Service worker `message` event handler
 *
 * Service worker process to handle incoming messages.
 *
 * @param client - The client sending the message.
 * @param data - The data attached to the message.
 */
export async function onMessage(client: Client, data: ClientMsgData): Promise<void> {
	// 1. Get currently connected clients.
	let clients = await worker.clients.matchAll();
	function broadcast(msgData: SwMsgData) {
		clients.forEach((client) => client.postMessage(msgData));
	}
	// 2. Ensure WASM is initialized.
	if (!wasm) await initializeInterfaces();

	// 3. Handle incoming message.
	switch (data.msgCode) {
		case "initialize": {
			await initializeInterfaces();
			broadcast({ msgCode: "initialized" });
			break;
		}
		case "get-node-id": {
			const nodeId = wasm.engine.get_node_id();
			broadcast({
				msgCode: "node-id",
				payload: { nodeId }
			});
			break;
		}
		case "test-clock": {
			break;
		}
		case "update-time-offset": {
			const updatedOffset = data.payload.value as number;
			wasm.setOffset(updatedOffset);
			clients = await worker.clients.matchAll();
			clients[0].postMessage({
				msgCode: "time-offset-value",
				payload: { value: updatedOffset }
			});
			break;
		}
		case "no-sync-connection": {
			clients = await worker.clients.matchAll();
			// 1. Retrieve last calculated time offset from local storage if available.
			clients[0].postMessage({
				msgCode: "retrieve-time-offset"
			});
			// 2. Update offline values in client stores.
			broadcast({
				msgCode: "offline-value",
				payload: { value: true }
			});
			break;
		}
	}
}
