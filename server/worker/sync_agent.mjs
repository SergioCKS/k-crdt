import { parseClientBinaryMessage, buildServerBinaryMessage } from "./messages.mjs";
import { ServerHLC, Timestamp, UID } from "./engine_bg.mjs";
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
        for (const cid of Object.keys(this.sessions)) {
            try {
                this.sessions[cid].ws.send(message);
            }
            catch {
                delete this.sessions[cid];
            }
        }
    }
    messageClient(ws, message) {
        ws.send(JSON.stringify(message));
    }
    /**
     * ### Handle client message
     *
     * Event handler for UTF-8 encoded (string) messages from client nodes.
     *
     * @param message Incoming message
     */
    handleClientMessage(connectionId, message) {
        const session = this.sessions[connectionId];
        const ws = session?.ws;
        switch (message.msgCode) {
            case "time-sync": {
                const timeSyncPayload = message.payload;
                this.messageClient(ws, {
                    msgCode: "time-sync",
                    payload: {
                        t0: timeSyncPayload.t0,
                        t1: new Date().valueOf()
                    }
                });
                return true;
            }
            case "node-id": {
                session.nid = message.payload.value;
                return true;
            }
            case "test": {
                this.messageClient(ws, {
                    msgCode: "test",
                    payload: "hey"
                });
                return true;
            }
        }
    }
    /**
     * ## Handle binary client message
     *
     * Handles an incoming client-originated binary message.
     *
     * @param message - Binary message
     */
    handleBinaryClientMessage(connectionId, message) {
        const session = this.sessions[connectionId];
        const ws = session?.ws;
        switch (message.msgCode) {
            case "test": {
                return true;
            }
            case "bool-register": {
                const { ts, id, register } = message.components;
                // #region Update HLC
                if (!this.hlc)
                    return true;
                const message_ts = Timestamp.deserialize(ts);
                try {
                    this.hlc.updateWithTimestamp(message_ts);
                }
                catch {
                    ws?.send(JSON.stringify({ msgCode: "test", payload: "Failed to update HLC." }));
                    return true;
                }
                // #endregion
                const nidStr = session?.nid;
                if (nidStr) {
                    try {
                        const nid = UID.fromString(nidStr).serialize();
                        const binMessage = buildServerBinaryMessage({
                            msgCode: "bool-register",
                            components: { nid, ts, id, register }
                        });
                        this.broadcastMessage(binMessage);
                        // ws?.send(binMessage);
                    }
                    catch (e) {
                        this.messageClient(ws, {
                            msgCode: "test",
                            payload: e
                        });
                    }
                }
                return true;
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
        //#region WebSocket event handlers
        server.addEventListener("message", async ({ data }) => {
            if (data instanceof ArrayBuffer) {
                this.handleBinaryClientMessage(connectionId, parseClientBinaryMessage(new Uint8Array(data)));
            }
            else {
                try {
                    const message = JSON.parse(data);
                    await this.handleClientMessage(connectionId, message);
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
