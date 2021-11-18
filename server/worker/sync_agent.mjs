import { get_message, parse_update_message } from "./engine_bg.mjs";
export class SyncAgent {
    state;
    sessions;
    constructor(state, env) {
        env;
        this.state = state;
        this.sessions = [];
    }
    async fetch(request) {
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
            return new Response("Expected Upgrade: websocket", { status: 426 });
        }
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        server.accept();
        server.addEventListener("message", async ({ data: rawData }) => {
            const isBinary = rawData instanceof ArrayBuffer;
            if (isBinary) {
                let binData = rawData;
                const nodeId = parse_update_message(new Uint8Array(binData));
                server.send(JSON.stringify({
                    msgCode: "test",
                    payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed node ID: ${nodeId}`,
                }));
                return;
            }
            let parsedData;
            try {
                parsedData = JSON.parse(rawData);
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
            if (!Object.prototype.hasOwnProperty.call(parsedData, "msgCode")) {
                // Broadcast message and purge inactive sessions.
                this.sessions = this.sessions.filter(session => {
                    try {
                        session.send(rawData);
                        return true;
                    }
                    catch {
                        return false;
                    }
                });
                return;
            }
            switch (parsedData.msgCode) {
                case "time-sync": {
                    const timeSyncPayload = parsedData.payload;
                    server.send(JSON.stringify({
                        msgCode: "time-sync",
                        payload: {
                            t0: timeSyncPayload.t0,
                            t1: new Date().valueOf(),
                        },
                    }));
                    break;
                }
                case "ts-test": {
                    // const ts = this.engine?.generate_timestamp();
                    server.send(JSON.stringify({
                        msgCode: "ts-test",
                        payload: {
                            value: get_message(),
                        },
                    }));
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
