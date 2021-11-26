import { ClientMessage, ServerMessage } from "./messages.mjs";
import { parseUpdateMessage, ServerHLC, UID } from "./engine_bg.mjs";

interface Env {
	COUNTER: any;
}

interface Session {
	ws: WebSocket;
	nid?: string;
}

export class SyncAgent {
	state: DurableObjectState;
	sessions: Record<string, Session>;
	hlc: ServerHLC | null;

	constructor(state: DurableObjectState, env: Env) {
		env;
		this.state = state;
		this.sessions = {};
		this.hlc = null;

		this.state.blockConcurrencyWhile(async () => {
			let hlcBuffer = (await this.state.storage.get("hlc")) as ArrayBuffer | null;
			this.hlc = hlcBuffer ? ServerHLC.deserialize(new Uint8Array(hlcBuffer)) : new ServerHLC();
		});
	}

	broadcastMessage(message: string | ArrayBuffer) {
		for (const cid in this.sessions) {
			try {
				this.sessions[cid].ws.send(message);
			} catch {
				delete this.sessions[cid];
			}
		}
	}

	async fetch(request: Request): Promise<Response> {
		// let currentHLC = this.hlc;
		// let currState = this.state;
		let sessions = this.sessions;

		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response("Expected Upgrade: websocket", { status: 426 });
		}

		// Generate a random connection ID.
		const connectionId = new UID().toString();

		// Establish WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		function messageClient(message: ServerMessage) {
			server.send(JSON.stringify(message));
		}

		async function handleClientMessage(message: ClientMessage): Promise<boolean> {
			switch (message.msgCode) {
				case "time-sync": {
					const timeSyncPayload = message.payload;

					messageClient({
						msgCode: "time-sync",
						payload: {
							t0: timeSyncPayload.t0,
							t1: new Date().valueOf()
						}
					});
					return true;
				}
				case "node-id": {
					sessions[connectionId].nid = message.payload.value;
				}
				case "test": {
					messageClient({
						msgCode: "test",
						payload: JSON.stringify(
							Object.keys(sessions).map((k) => k + (sessions[k].nid || "no nid"))
						)
					});
					return true;
				}
			}
		}

		server.accept();

		server.addEventListener("message", async ({ data: rawData }) => {
			if (rawData instanceof ArrayBuffer) {
				let binData = rawData as ArrayBuffer;
				const id = parseUpdateMessage(new Uint8Array(binData));
				server.send(
					JSON.stringify({
						msgCode: "test",
						payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed ID: ${id}`
					})
				);
			} else {
				try {
					const msg = JSON.parse(rawData) as ClientMessage;
					await handleClientMessage(msg);
				} catch (e) {
					if (e instanceof SyntaxError) {
						console.error("JSON couldn't be parsed");
					} else {
						console.error(e);
					}
				}
			}
		});

		server.addEventListener("close", (event: any) => console.log(event));

		// Store the connection in memory.
		this.sessions[connectionId] = { ws: server };

		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}
}
