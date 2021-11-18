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
		| "no-sync-connection"
		| "create-bool-register"
		| "restore-registers";
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
		| "new-register"
		| "restored-registers"
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
	let nodeId = await wasm.initialize();

	// 3. Open DB
	nodeId = await localDb.initialize(nodeId);

	// 4. Set node ID in WASM engine.
	wasm.setNodeId(nodeId);

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
		case "create-bool-register": {
			// 1. Get register initial value from message.
			const initialValue = data.payload.value as boolean;

			// 2. Create register and retrieve values.
			const register = wasm.engine.create_bool_register(initialValue);
			const id = register.get_id();
			const value = register.get_value();
			const encoded = register.get_encoded();

			// 3. Broadcast the newly created register to the front-end clients.
			broadcast({
				msgCode: "new-register",
				payload: { id, value, type: "bool" }
			});

			// 4. Persist encoded version in local database.
			try {
				await localDb.put_crdt({ id, value, encoded, type: "bool" });
			} catch (e) {
				console.error(e);
				return;
			}

			// 5. Broadcast the event to other nodes.
			const updateMessage = register.get_update_message(
				wasm.engine.get_node_id(),
				wasm.engine.generate_timestamp()
			);
			syncConnection.sendMessage(updateMessage);

			// syncConnection.sendMessage();

			register.free();
			break;
		}
		case "restore-registers": {
			try {
				const crdts = (await localDb.retrieveCrdts()) as {
					id: string;
					value: boolean;
					encoded: Uint8Array;
					type: string;
				}[];

				const crdts_obj = {};
				for (const crdt of crdts) {
					crdts_obj[crdt.id] = { value: crdt.value, type: crdt.type };
				}

				client.postMessage({
					msgCode: "restored-registers",
					payload: { value: crdts_obj }
				});
			} catch (e) {
				console.error(e);
			}
			break;
		}
	}
}
