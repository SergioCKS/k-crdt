/**
 * # Synchronization Agent Interface
 *
 * Interface object for interacting with a synchronization agent (server).
 *
 * The synchronization agent is currently responsible for:
 *
 * * Time synchronization
 * * Update broadcasting
 * * Global storage
 *
 * @module
 */

import {
	AppMessage,
	AppMessageCode,
	ClientMessage,
	ClientMessageCode,
	ServerMessage,
	ServerMessageCode
} from "$types/messages";

/**
 * ## Worker scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

/**
 * ## Message worker
 *
 * Send a message to the worker (as the worker).
 *
 * @param message - Message to send
 */
function messageWorker(message: AppMessage) {
	worker.registration.active.postMessage(message);
}

/**
 * ## Time sync data
 *
 * Result from a time synchronization poll request.
 *
 * The time difference between the client and server is the total offset minus the total round-trip delay.
 */
interface TimeSyncData {
	/**
	 * ### Total Offset
	 *
	 * Difference in time from the client perspective including the round-trip delay.
	 *
	 */
	offset: number;

	/**
	 * ### Round-trip delay
	 *
	 * Total time spent in message transmission during the poll request.
	 *
	 * The total round-trip delay is the sum of the request transmission delay and the response transmission delay.
	 */
	roundTripDelay: number;
}

/**
 * ## Time sync poll response payload
 *
 * Server response to a time synchronization poll request.
 */
type TimeSyncPollResponsePayload = {
	/**
	 * ### Request transmission timestamp
	 *
	 * Client-side timestamp that is as close as possible to packet transmission of the request message in milliseconds since UNIX epoch.
	 */
	t0: number;

	/**
	 * ### Request reception timestamp
	 *
	 * Server-side timestamp that is as close as possible to packet reception of the request message in milliseconds since UNIX epoch.
	 */
	t1: number;

	/**
	 * ### Response transmission timestamp
	 *
	 * Server-side timestamp that is as close as possible to packet transmission of the response message in milliseconds since UNIX epoch.
	 */
	t2?: number;
};

/**
 * ## Get time sync data
 *
 * Compute the time offset and round-trip delay from the timestamps of a poll.
 *
 * Reference: [NTP clock synchronization algorithm](https://en.wikipedia.org/wiki/Network_Time_Protocol#Clock_synchronization_algorithm)
 *
 * @param t0 Client-side timestamp that is as close as possible to packet transmission of the request message.
 * @param t1 Server-side timestamp that is as close as possible to packet reception of the request message.
 * @param t2 Server-side timestamp that is as close as possible to packet transmission of the response message.
 * @param t3 Client-side timestamp that is as close as possible to packet reception of the response message.
 * @returns Time offset and round-trip delay.
 */
function getTimeSyncData(t0: number, t1: number, t2: number, t3: number): TimeSyncData {
	return {
		offset: (t1 - t0 + t2 - t3) / 2,
		roundTripDelay: t3 - t0 - (t2 - t1)
	};
}

/**
 * ## Handle server message
 *
 * Handles an incoming server-originated message.
 *
 * @param msgCode - Message code
 * @param payload - Message payload
 */
function handleServerMessage(
	msgCode: ServerMessageCode,
	payload: Record<string, unknown>
): boolean {
	switch (msgCode) {
		case ServerMessageCode.TimeSync: {
			// Client-side response reception time (t4 in time-sync poll).
			const receptionTime = new Date().valueOf();
			const timeSyncPayload = payload as TimeSyncPollResponsePayload;
			const syncData = getTimeSyncData(
				timeSyncPayload.t0,
				timeSyncPayload.t1,
				timeSyncPayload.t1, // t2 = t1
				receptionTime // t3
			);
			messageWorker({
				msgCode: AppMessageCode.UpdateTimeOffset,
				payload: { value: syncData.offset }
			});
			return true;
		}
		case ServerMessageCode.Test: {
			console.log(payload);
			return true;
		}
	}
}

/**
 * ## Handle server binary message
 *
 * Handles an incoming server-originated message in binary format.
 *
 * @param data - Message data as byte array
 */
async function handleServerBinaryMessage(data: Uint8Array): Promise<boolean> {
	console.log("Binary data received from server.", data);
	return true;
}

/**
 * ## Sync Connection
 *
 * Interface to a WebSocket connection between the web worker and an external synchronization manager.
 */
export class SyncConnection {
	//#region Attributes
	/**
	 * ### WebSocket
	 *
	 * WebSocket connection to the sync manager.
	 */
	private _ws: WebSocket = undefined;

	/**
	 * ### Sync URL
	 *
	 * URL of the synchronization manager service.
	 */
	private _syncUrl: URL = undefined;
	//#endregion

	/**
	 * ### SyncConnection Constructor
	 *
	 * Construct a new connection to a synchronization manager service.
	 *
	 * @param url URL of the synchronization manager service.
	 */
	constructor(url: URL) {
		this._syncUrl = url;
	}

	/**
	 * ### Message server
	 *
	 * Sends a string-based message to the server.
	 *
	 * @param message Message to send
	 */
	public messageServer(message: ClientMessage): void {
		this.sendMessage(JSON.stringify(message));
	}

	/**
	 * ### Initialize connection
	 *
	 * Initializes the connection to the sync manager.
	 */
	public initialize(forceRestart = false): Promise<void> {
		return new Promise((resolve, reject) => {
			// Restart if web socket is active.
			if (this._ws && [0, 1].includes(this._ws.readyState)) {
				if (forceRestart) {
					this._ws.close(1012, "Restarting connection.");
				} else {
					resolve();
				}
			}
			const ws = new WebSocket(this._syncUrl);

			ws.addEventListener("error", (event) => {
				console.error(event);
				// Error connecting to WebSocket (device could be offline).
				messageWorker({
					msgCode: AppMessageCode.NoSyncConnection
				});
				reject(event);
			});

			ws.addEventListener("message", async ({ data: rawData }) => {
				try {
					if (rawData instanceof ArrayBuffer) {
						await handleServerBinaryMessage(new Uint8Array(rawData));
					} else {
						const msg = JSON.parse(rawData) as ServerMessage;
						handleServerMessage(msg.msgCode, msg.payload);
					}
				} catch (error) {
					if (error instanceof SyntaxError) {
						console.error("Error while handling server event. JSON couldn't be parsed");
					} else {
						console.error("Error while handling server event.", error);
					}
				}
			});

			ws.addEventListener("close", () => {
				console.log("Closed connection to the synchronization manager.");
			});

			ws.addEventListener("open", async () => {
				// Perform time synchronization poll on socket initialization.
				this.messageServer({
					msgCode: ClientMessageCode.TimeSync,
					payload: { t0: new Date().valueOf() }
				});
				resolve();
			});

			this._ws = ws;
		});
	}

	/**
	 * ### Sync connection is initialized?
	 *
	 * Whether or not the sync connection was initialized properly.
	 */
	public is_initialized(): boolean {
		return !!this._ws;
	}

	//#region Getters
	/**
	 * ### Get WebSocket
	 *
	 * Getter for the internal WebSocket connection.
	 */
	public get ws(): WebSocket {
		return this._ws;
	}

	/**
	 * ### Get Sync URL
	 *
	 * Getter for the URL of the synchronization manager service.
	 */
	public get syncUrl(): URL {
		return this._syncUrl;
	}
	//#endregion

	/**
	 * ### Send Message
	 *
	 * Send a message to the sync manager.
	 *
	 * @param msg Message
	 * @throws Error - If the WebSocket connection is not active.
	 */
	public sendMessage(msg: string | ArrayBufferLike | Blob): void {
		if (this._ws && this._ws.readyState === 1) {
			this._ws.send(msg);
		} else {
			throw Error(
				"WebSocket connection is not active. The connection may not have been initialized properly."
			);
		}
	}

	/**
	 * ### Close sync connection
	 *
	 * Closes the connection to the sync manager on request.
	 */
	public close(): void {
		if (this._ws && this._ws.readyState === 1) {
			this._ws.close();
		}
	}
}
