import { ClientMessageCode, ServerMessageCode, } from "./messages.mjs";
import { get_message, parse_update_message } from "./engine_bg.mjs";
export class SyncAgent {
    state;
    sessions;
    constructor(state, env) {
        env;
        this.state = state;
        this.sessions = [];
    }
    broadcastMessage(message) {
        this.sessions = this.sessions.filter(session => {
            try {
                session.send(message);
                return true;
            }
            catch {
                return false;
            }
        });
    }
    async fetch(request) {
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
            return new Response("Expected Upgrade: websocket", { status: 426 });
        }
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        function messageClient(message) {
            server.send(JSON.stringify(message));
        }
        function handleClientMessage(msgCode, payload) {
            switch (msgCode) {
                case ClientMessageCode.TimeSync: {
                    const timeSyncPayload = payload;
                    messageClient({
                        msgCode: ServerMessageCode.TimeSync,
                        payload: {
                            t0: timeSyncPayload.t0,
                            t1: new Date().valueOf(),
                        },
                    });
                    return true;
                }
                case ClientMessageCode.Test: {
                    messageClient({
                        msgCode: ServerMessageCode.Test,
                        payload: { value: get_message() },
                    });
                    return true;
                }
            }
        }
        server.accept();
        server.addEventListener("message", async ({ data: rawData }) => {
            if (rawData instanceof ArrayBuffer) {
                let binData = rawData;
                const nodeId = parse_update_message(new Uint8Array(binData));
                server.send(JSON.stringify({
                    msgCode: "test",
                    payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed node ID: ${nodeId}`,
                }));
            }
            else {
                try {
                    const msg = JSON.parse(rawData);
                    handleClientMessage(msg.msgCode, msg.payload);
                }
                catch (e) {
                    if (e instanceof SyntaxError) {
                        console.error("JSON couldn't be parsed");
                    }
                    else {
                        console.error(e);
                    }
                    return;
                }
            }
        });
        server.addEventListener("close", (event) => console.log(event));
        this.sessions.push(server);
        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }
}
