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
import {
	WorkerMessage,
	AppMessageCode,
	WorkerMessageCode,
	requireWasm,
	ClientMessageCode
} from "$types/messages";

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
 * ## Message any client
 *
 * Send a message to any connected client.
 *
 * @param message Message to send
 */
async function messageAnyClient(message: WorkerMessage) {
	const anyClient = (await worker.clients.matchAll())[0];
	anyClient.postMessage(message);
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
	let nodeId = await wasm.initialize();

	// 3. Open DB
	nodeId = await localDb.initialize(nodeId);

	// 4. Set node ID in WASM engine.
	wasm.setNodeId(nodeId);

	// 7. Initialize connection to sync manager.
	syncConnection.initialize(forceRestart);
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
	msgCode: AppMessageCode,
	payload: Record<string, unknown>
): Promise<boolean> {
	// 1. Ensure WASM is initialized if the message requires it.
	if (msgCode in requireWasm && !wasm) await initializeInterfaces();

	// 2. Handle incoming message.
	switch (msgCode) {
		case AppMessageCode.Initialize: {
			await initializeInterfaces();
			broadcastMessage({ msgCode: WorkerMessageCode.Initialized });
			return true;
		}
		case AppMessageCode.Test: {
			syncConnection.messageServer({
				msgCode: ClientMessageCode.Test
			});
			return true;
		}
		case AppMessageCode.UpdateTimeOffset: {
			const updatedOffset = payload.value as number;
			wasm.setOffset(updatedOffset);
			messageClient(client, {
				msgCode: WorkerMessageCode.TimeOffsetValue,
				payload: { value: updatedOffset }
			});
			return true;
		}
		case AppMessageCode.NoSyncConnection: {
			// 1. Retrieve last calculated time offset from local storage if available.
			await messageAnyClient({ msgCode: WorkerMessageCode.RetrieveTimeOffset });

			// 2. Update offline values in client stores.
			broadcastMessage({
				msgCode: WorkerMessageCode.OfflineValue,
				payload: { value: true }
			});
			return true;
		}
		case AppMessageCode.CreateBoolRegister: {
			// 1. Get register initial value from message.
			const initialValue = payload.value as boolean;

			// 2. Create register and retrieve values.
			const register = wasm.engine.create_bool_register(initialValue);
			const id = register.get_id();
			const value = register.get_value();
			const encoded = register.get_encoded();

			// 3. Broadcast the newly created register to the front-end clients.
			broadcastMessage({
				msgCode: WorkerMessageCode.NewRegister,
				payload: { id, value, type: "bool" }
			});

			// 4. Persist encoded version in local database.
			try {
				await localDb.put_crdt({ id, value, encoded, type: "bool" });
			} catch (e) {
				console.error(e);
				return true;
			}

			// 5. Broadcast the event to other nodes.
			const updateMessage = register.get_update_message(
				wasm.engine.get_node_id(),
				wasm.engine.generate_timestamp()
			);
			syncConnection.sendMessage(updateMessage);

			// syncConnection.sendMessage();

			register.free();
			return true;
		}
		case AppMessageCode.RestoreRegisters: {
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

				messageClient(client, {
					msgCode: WorkerMessageCode.RestoredRegisters,
					payload: { value: crdts_obj }
				});
			} catch (e) {
				console.error(e);
			}
			return true;
		}
	}
}
