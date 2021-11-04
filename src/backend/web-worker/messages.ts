/**
 * # Web Worker - Messages
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

//#region Interface objects
let wasm: Wasm;
let localDb: LocalDb;
let syncConnection: SyncConnection;
//#endregion

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
		syncConnection = new SyncConnection(new URL("wss://crdt.zeda.tech/ws"));
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
	wasm.engine.restore_state(counterState);

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
	if (!wasm) {
		await initializeInterfaces();
		// broadcast({ msgCode: "initialized" });
	}
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
		case "get-gcounter-value": {
			const value = wasm.engine.get_counter_value();
			broadcast({
				msgCode: "counter-value",
				payload: { value }
			});
			break;
		}
		case "increment-counter": {
			// 1. Increment counter.
			wasm.engine.increment_counter();
			// 2. Get counter value.
			const value = wasm.engine.get_counter_value();
			// 3. Serialize counter state.
			let serializedCounter: string;
			try {
				serializedCounter = wasm.engine.serialize_counter();
				console.log(serializedCounter);
			} catch (e) {
				console.error(e);
				client.postMessage({
					msgCode: "error",
					payload: e
				});
			}
			// 4. Broadcast value.
			broadcast({
				msgCode: "counter-value",
				payload: { value }
			});
			// 5. Persist counter state.
			const transaction = localDb.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			objectStore.put({
				id: "counter",
				state: serializedCounter
			});
			// 6. Send state message to sync manager.
			syncConnection.sendMessage(serializedCounter);
			break;
		}
		case "decrement-counter": {
			// 1. Decrement counter.
			wasm.engine.decrement_counter();
			// 2. Get counter value.
			const value = wasm.engine.get_counter_value();
			// 3. Serialize counter state.
			let serializedCounter: string;
			try {
				serializedCounter = wasm.engine.serialize_counter();
				console.log(serializedCounter);
			} catch (e) {
				console.error(e);
				client.postMessage({
					msgCode: "error",
					payload: e
				});
			}
			// 4. Broadcast value.
			broadcast({
				msgCode: "counter-value",
				payload: { value }
			});
			// 5. Persist counter state.
			const transaction = localDb.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			objectStore.put({
				id: "counter",
				state: serializedCounter
			});
			// 6. Send state message to sync manager.
			syncConnection.sendMessage(serializedCounter);
			break;
		}
		case "toggle-register": {
			// 1. Toggle register.
			wasm.engine.toggle_register();
			// 2. Get register value.
			const value = wasm.engine.get_register_value();
			// 3. Serialize register state.
			let updateMessage: string;
			try {
				updateMessage = wasm.engine.get_register_update_message();
			} catch (e) {
				console.error(e);
				client.postMessage({
					msgCode: "error",
					payload: e
				});
			}
			// 4. Broadcast value.
			broadcast({
				msgCode: "register-value",
				payload: { value }
			});
			// 5. Persist register state.
			const transaction = localDb.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			objectStore.put({
				id: "register",
				state: updateMessage
			});
			// 6. Send state message to sync manager.
			syncConnection.sendMessage(updateMessage);
			break;
		}
		case "incoming-update": {
			const state = data.payload.state as string;
			// 1. Merge state update
			wasm.engine.merge_from_message(state);
			// 2. Get counter value.
			const value = wasm.engine.get_counter_value();
			// 3. Serialize counter state.
			let serializedCounter: string;
			try {
				serializedCounter = wasm.engine.serialize_counter();
			} catch (e) {
				console.error(e);
				client.postMessage({
					msgCode: "error",
					payload: e
				});
			}
			// 4. Broadcast value.
			broadcast({
				msgCode: "counter-value",
				payload: { value }
			});
			// 5. Persist counter state.
			const transaction = localDb.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			objectStore.put({
				id: "counter",
				state: serializedCounter
			});
			break;
		}
		case "incoming-register-update": {
			const nid = data.payload.nid as string;
			const state = data.payload.state as string;
			console.log("before merge", state);
			// 1. Merge state update
			wasm.engine.merge_register_from_message(state, nid);
			// 2. Get register value.
			const value = wasm.engine.get_register_value();
			console.log(value);
			// 3. Serialize register state.
			let serializedRegister: string;
			try {
				serializedRegister = wasm.engine.serialize_register();
				console.log("after merge", serializedRegister);
			} catch (e) {
				console.error(e);
				client.postMessage({
					msgCode: "error",
					payload: e
				});
			}
			// 4. Broadcast value.
			broadcast({
				msgCode: "register-value",
				payload: { value }
			});
			// 5. Persist counter state.
			const transaction = localDb.db.transaction(["crdts"], "readwrite");
			const objectStore = transaction.objectStore("crdts");
			objectStore.put({
				id: "register",
				state: serializedRegister
			});
			break;
		}
		case "test-clock": {
			try {
				const ts = wasm.testClock();
				console.log(ts);
			} catch (e) {
				console.log(e);
			}
			break;
		}
		case "update-time-offset": {
			const updatedOffset = data.payload.value as number;
			wasm.engine.set_time_offset(updatedOffset);
			clients = await worker.clients.matchAll();
			clients[0].postMessage({
				msgCode: "time-offset-value",
				payload: { value: updatedOffset }
			});
			console.log(wasm.engine.get_time_offset());
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
