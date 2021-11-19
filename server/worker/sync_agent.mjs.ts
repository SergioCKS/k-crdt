import {
  ClientMessage,
  ClientMessageCode,
  ServerMessage,
  ServerMessageCode,
} from "./messages.mjs";
import { get_message, parse_update_message } from "./engine_bg.mjs";

interface Env {
  COUNTER: any;
}

type TimeSyncPollRequestPayload = {
  t0: number;
};

export class SyncAgent {
  state: DurableObjectState;
  sessions: WebSocket[];

  constructor(state: DurableObjectState, env: Env) {
    env;
    this.state = state;
    this.sessions = [];
  }

  broadcastMessage(message: string | ArrayBuffer) {
    this.sessions = this.sessions.filter(session => {
      try {
        session.send(message);
        return true;
      } catch {
        return false;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    function messageClient(message: ServerMessage) {
      server.send(JSON.stringify(message));
    }

    function handleClientMessage(
      msgCode: ClientMessageCode,
      payload: Record<string, unknown> | unknown
    ): boolean {
      switch (msgCode) {
        case ClientMessageCode.TimeSync: {
          const timeSyncPayload = payload as TimeSyncPollRequestPayload;

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
        let binData = rawData as ArrayBuffer;
        const nodeId = parse_update_message(new Uint8Array(binData));
        server.send(
          JSON.stringify({
            msgCode: "test",
            payload: `Received binary data consisting of ${binData.byteLength} bytes. Parsed node ID: ${nodeId}`,
          })
        );
      } else {
        try {
          const msg = JSON.parse(rawData) as ClientMessage;
          handleClientMessage(msg.msgCode, msg.payload);
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.error("JSON couldn't be parsed");
          } else {
            console.error(e);
          }
          return;
        }
      }
    });

    server.addEventListener("close", (event: any) => console.log(event));
    this.sessions.push(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
