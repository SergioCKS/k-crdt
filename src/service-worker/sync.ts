/**
 * ## Worker Scope
 *
 * Typed `self` assuming the script is run on a service worker context.
 */
const worker = self as unknown as ServiceWorkerGlobalScope;

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

		if (!ws) {
			throw new Error(
				"Error while attempting to establish a connection with the synchronization manager."
			);
		}

		//#region Setup event listeners
		ws.addEventListener("open", () => {
			console.log("Opened connection to the synchronization manager.");
		});

		ws.addEventListener("message", async ({ data }) => {
			const msg = JSON.parse(data) as { msgCode?: string; state?: string; nid?: string };
			if (msg.msgCode) {
				worker.registration.active.postMessage({
					msgCode: "incoming-register-update",
					payload: {
						state: msg.state,
						otherNid: msg.nid
					}
				});
			} else {
				worker.registration.active.postMessage({
					msgCode: "incoming-update",
					payload: { state: data }
				});
			}
		});

		ws.addEventListener("close", () => {
			console.log("Closed connection to the synchronization manager.");
		});
		//#endregion

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
		console.log("Sendinge message through WebSocket.", msg);
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
