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

/**
 * ## Worker scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

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
interface TimeSyncPollResponsePayload {
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
}

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
	 * ### Initialize connection
	 *
	 * Initializes the connection to the sync manager.
	 */
	public initialize(forceRestart = false): void {
		// Restart if web socket is active.
		if (this._ws && [0, 1].includes(this._ws.readyState)) {
			if (forceRestart) {
				this._ws.close(1012, "Restarting connection.");
			} else {
				return;
			}
		}

		const ws = new WebSocket(this._syncUrl);

		ws.addEventListener("error", (event) => {
			console.error(event);
			// Error connecting to WebSocket (device could be offline).
			worker.registration.active.postMessage({
				msgCode: "no-sync-connection"
			});
		});

		ws.addEventListener("open", async () => {
			// Perform time synchronization poll on socket initialization.
			this.sendMessage(
				JSON.stringify({
					msgCode: "time-sync",
					payload: {
						t0: new Date().valueOf()
					}
				})
			);
		});

		ws.addEventListener("message", async ({ data: rawData }) => {
			// Client-side response reception time (t4 in time-sync poll).
			const receptionTime = new Date().valueOf();

			// Parse message data.
			let parsedData: Record<string, unknown>;
			try {
				parsedData = JSON.parse(rawData);
			} catch (e) {
				if (e instanceof SyntaxError) {
					console.error("JSON couldn't be parsed");
				} else {
					console.error(e);
				}
				return;
			}

			// Unspecified message code case.
			if (!Object.prototype.hasOwnProperty.call(parsedData, "msgCode")) return;

			// Handler based on message code.
			switch (parsedData.msgCode) {
				case "time-sync": {
					const timeSyncPayload = parsedData.payload as TimeSyncPollResponsePayload;
					const syncData = getTimeSyncData(
						timeSyncPayload.t0,
						timeSyncPayload.t1,
						timeSyncPayload.t1, // t2 = t1
						receptionTime // t3
					);
					worker.registration.active.postMessage({
						msgCode: "update-time-offset",
						payload: {
							value: syncData.offset
						}
					});
					break;
				}
				case "ts-test": {
					const tsTestPayload = parsedData.payload as { value: string };
					console.log("ts-test:", tsTestPayload.value);
					break;
				}
				case "test": {
					const testPayload = parsedData.payload;
					console.log(testPayload);
				}
			}
		});

		ws.addEventListener("close", () => {
			console.log("Closed connection to the synchronization manager.");
		});

		this._ws = ws;
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
