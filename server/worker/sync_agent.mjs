import { parseUpdateMessage, ServerHLC, UID } from "./engine_bg.mjs";
/**
 * ## Sync Agent
 *
 * Durable object responsible for storing and syncing a data collection among the involved nodes.
 */
export class SyncAgent {
    //#region Attributes
    /**
     * ### Durable object state
     *
     * Interface to the durable object storage API.
     */
    state;
    /**
     * ### Sessions
     *
     * Object storing websocket connections to client nodes as well as node IDs of clients.
     */
    sessions;
    /**
     * ### HLC
     *
     * Hybrid logical clock used to generate timestamps.
     */
    hlc;
    //#endregion
    constructor(state, env) {
        env;
        this.state = state;
        this.sessions = {};
        this.hlc = null;
        this.state.blockConcurrencyWhile(async () => {
            // Restore HLC or create a new one.
            let hlcBuffer = (await this.state.storage.get("hlc"));
            this.hlc = hlcBuffer ? ServerHLC.deserialize(new Uint8Array(hlcBuffer)) : new ServerHLC();
        });
    }
    /**
     * ### Broadcast message
     *
     * Sends a message to all connected clients purging stale sessions.
     *
     * @param message Message to send
     */
    broadcastMessage(message) {
        for (const cid in this.sessions) {
            try {
                this.sessions[cid].ws.send(message);
            }
            catch {
                delete this.sessions[cid];
            }
        }
    }
    /**
     * ### Fetch
     *
     * Handler for requests relayed from a worker. Only WebSocket requests should be relayed to the
     * durable object.
     *
     * @param request Incoming WebSocket upgrade request
     * @returns WebSocket upgrade response
     */
    async fetch(request) {
        let currentHLC = this.hlc;
        // let currState = this.state;
        let sessions = this.sessions;
        // Assert request is a WebSocket upgrade request.
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
            return new Response("Expected Upgrade: websocket", { status: 426 });
        }
        // Generate a random connection ID.
        const connectionId = new UID().toString();
        // Create WebSocket objects.
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        server.accept();
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
                case "node-id": {
                    sessions[connectionId].nid = message.payload.value;
                    return true;
                }
                case "test": {
                    messageClient({
                        msgCode: "test",
                        payload: JSON.stringify(Object.keys(sessions).map((k) => k + (sessions[k].nid || "no nid")))
                    });
                    return true;
                }
            }
        }
        //#region WebSocket event handlers
        server.addEventListener("message", async ({ data }) => {
            if (data instanceof ArrayBuffer) {
                // Binary message.
                let binData = data;
                //#region Update HLC
                if (!currentHLC)
                    return;
                const ts = parseUpdateMessage(new Uint8Array(binData));
                try {
                    currentHLC.updateWithTimestamp(ts);
                }
                catch {
                    server.send(JSON.stringify({ msgCode: "test", payload: "Failed to update HLC." }));
                    return;
                }
                //#endregion
                server.send(JSON.stringify({
                    msgCode: "test",
                    payload: `Received binary data consisting of ${binData.byteLength} bytes. Last time: ${currentHLC.last_time.toString()}`
                }));
            }
            else {
                // UTF-8 encoded message (string).
                try {
                    const msg = JSON.parse(data);
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
        server.addEventListener("close", () => {
            delete this.sessions[connectionId];
        });
        //#endregion
        // Store the connection in memory.
        this.sessions[connectionId] = { ws: server };
        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }
}
