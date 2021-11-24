import { ClientMessage, ClientMessageCode, ServerMessage, ServerMessageCode } from "./messages.mjs";
import { parse_update_message, ServerHLC } from "./engine_bg.mjs";

interface Env {
	COUNTER: any;
}

export class SyncAgent {
	state: DurableObjectState;
	sessions: WebSocket[];
	hlc: ServerHLC | null;

	constructor(state: DurableObjectState, env: Env) {
		env;
		this.state = state;
		this.sessions = [];
		this.hlc = null;

		this.state.blockConcurrencyWhile(async () => {
			let hlcBuffer = (await this.state.storage.get("hlc")) as ArrayBuffer | null;
			this.hlc = hlcBuffer ? ServerHLC.deserialize(new Uint8Array(hlcBuffer)) : new ServerHLC();
		});
	}

	broadcastMessage(message: string | ArrayBuffer) {
		this.sessions = this.sessions.filter((session) => {
			try {
				session.send(message);
				return true;
			} catch {
				return false;
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		let currentHLC = this.hlc;
		let currState = this.state;

		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response("Expected Upgrade: websocket", { status: 426 });
		}

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		function messageClient(message: ServerMessage) {
			server.send(JSON.stringify(message));
		}

		async function handleClientMessage(message: ClientMessage): Promise<boolean> {
			switch (message.msgCode) {
				case ClientMessageCode.TimeSync: {
					const timeSyncPayload = message.payload;

					messageClient({
						msgCode: ServerMessageCode.TimeSync,
						payload: {
							t0: timeSyncPayload.t0,
							t1: new Date().valueOf()
						}
					});
					return true;
				}
				case ClientMessageCode.Test: {
					currentHLC?.get_timestamp();
					const encoded = currentHLC?.serialize();
					currState.storage.put("hlc", encoded?.buffer);
					messageClient({
						msgCode: ServerMessageCode.Test,
						payload: { value: encoded }
					});
					return true;
				}
			}
		}

		server.accept();

		server.addEventListener("message", async ({ data: rawData }) => {
			if (rawData instanceof ArrayBuffer) {
				let binData = rawData as ArrayBuffer;
				const nodeId = parse_update_message(new Uint8Array(binData));
				server.send(
					JSON.stringify({
						msgCode: "test",
						payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed node ID: ${nodeId}`
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
		this.sessions.push(server);

		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}
}
