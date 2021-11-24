import { parse_update_message, ServerHLC } from "./engine_bg.mjs";
export class SyncAgent {
    state;
    sessions;
    hlc;
    constructor(state, env) {
        env;
        this.state = state;
        this.sessions = [];
        this.hlc = null;
        this.state.blockConcurrencyWhile(async () => {
            let hlcBuffer = (await this.state.storage.get("hlc"));
            this.hlc = hlcBuffer ? ServerHLC.deserialize(new Uint8Array(hlcBuffer)) : new ServerHLC();
        });
    }
    broadcastMessage(message) {
        this.sessions = this.sessions.filter((session) => {
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
        let currentHLC = this.hlc;
        let currState = this.state;
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
            return new Response("Expected Upgrade: websocket", { status: 426 });
        }
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        function messageClient(message) {
            server.send(JSON.stringify(message));
        }
        async function handleClientMessage(message) {
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
                case "test": {
                    currentHLC?.get_timestamp();
                    const encoded = currentHLC?.serialize();
                    currState.storage.put("hlc", encoded?.buffer);
                    messageClient({
                        msgCode: "test",
                        payload: { value: encoded }
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
                    payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed node ID: ${nodeId}`
                }));
            }
            else {
                try {
                    const msg = JSON.parse(rawData);
                    await handleClientMessage(msg);
                }
                catch (e) {
                    if (e instanceof SyntaxError) {
                        console.error("JSON couldn't be parsed");
                    }
                    else {
                        console.error(e);
                    }
                }
            }
        });
        server.addEventListener("close", (event) => console.log(event));
        this.sessions.push(server);
        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }
}
