/**
 * # Message types
 *
 * Unified message interface for event handling throughout the system.
 *
 * The following connections are modeled:
 *
 * * App <-> Worker (Via DOM events)
 * * Client <-> Server (Via WebSockets)
 *
 * These types are a dependency for both the client node code as well as the server node code,
 * as such, they are copied to the corresponding places on the build process.
 *
 * Messages of each actor (App, Worker, Client, Server) are added to a message object for which the
 * keys correspond to message codes and values are the types of the payload. From these message objects,
 * message types are built automatically and exported.
 * @module
 */

//#region Message objects
/**
 * ## App message object
 *
 * Object specifying the codes and payload types of app messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type AppMessageObj = {
  initialize: undefined;
  "update-time-offset": { value: number };
  "no-sync-connection": undefined;
  "restore-registers": undefined;
  "update-bool-register": {
    nid: Uint8Array;
    ts: Uint8Array;
    id: Uint8Array;
    register: Uint8Array;
  };
  test: undefined;
};

/**
 * ## Worker message object
 *
 * Object specifying the codes and payload types of worker messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type WorkerMessageObj = {
  initialized: undefined;
  "offline-value": { value: boolean };
  "restored-registers": { value: Record<string, unknown> };
};

/**
 * ## Client message object
 *
 * Object specifying the codes and payload types of client messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type ClientMessageObj = {
  "time-sync": { t0: number };
  "node-id": { value: string };
  test: undefined;
};

/**
 * ## Server message object
 *
 * Object specifying the codes and payload types of server messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type ServerMessageObj = {
  "time-sync": TimeSyncPayload;
  test: any;
};
//#endregion

//#region Message types
/**
 * ## Message types from message object
 *
 * Given a message object this type builds an object type having all keys of the message object
 * with the corresponding message type as value.
 */
type MessageTypes<MessageObj> = {
  [key in keyof MessageObj]: MessageObj[key] extends undefined
    ? {
        msgCode: key;
        payload?: undefined;
      }
    : {
        msgCode: key;
        payload: MessageObj[key];
      };
};

/**
 * ## App message (type)
 *
 * Type of a valid app message.
 */
export type AppMessage = MessageTypes<AppMessageObj>[keyof AppMessageObj];

/**
 * ## Worker message (type)
 *
 * Type of a valid worker message.
 */
export type WorkerMessage =
  MessageTypes<WorkerMessageObj>[keyof WorkerMessageObj];

/**
 * ## Client message (type)
 *
 * Type of a valid client message.
 */
export type ClientMessage =
  MessageTypes<ClientMessageObj>[keyof ClientMessageObj];

/**
 * ## Server message (type)
 *
 * Type of a valid server message.
 */
export type ServerMessage =
  MessageTypes<ServerMessageObj>[keyof ServerMessageObj];
//#endregion

//#region Others
/**
 * ## Time sync for `TimeSync` server message
 */
interface TimeSyncPayload {
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
//#endregion

//#region Binary message objects
interface BinaryMessageObj {
  [key: string]: {
    discriminant: number;
    components: { name: string; size: number }[];
  };
}

const TS_BYTES = 8 as 8;
const UID_BYTES = 16 as 16;
const BOOL_BYTES = 1 as 1;

/**
 * ## Client binary message object
 *
 * Object specifying all client-originated binary objects, including
 *
 * * The discriminant value used to identify messages of a specific kind
 * * The components that make up a message with their corresponding order and size in bytes.
 *
 * Discriminant and name types need to be casted as specific values in order to generate more
 * specific types from the object automatically.
 */
const clientBinaryMessageObj = {
  test: {
    discriminant: 0 as 0,
    components: [{ name: "payload" as "payload", size: UID_BYTES }],
  },
  "bool-register": {
    discriminant: 1 as 1,
    components: [
      { name: "ts" as "ts", size: TS_BYTES },
      { name: "id" as "id", size: UID_BYTES },
      { name: "register" as "register", size: TS_BYTES + BOOL_BYTES },
    ],
  },
};
type ClientBinaryMessageObj = typeof clientBinaryMessageObj;

/**
 * ## Server binary message object
 *
 * Object specifying all server-originated binary objects, including
 *
 * * The discriminant value used to identify messages of a specific kind
 * * The components that make up a message with their corresponding order and size in bytes.
 *
 * Discriminant and name types need to be casted as specific values in order to generate more
 * specific types from the object automatically.
 */
const serverBinaryMessageObj = {
  "bool-register": {
    discriminant: 1 as 1,
    components: [
      { name: "nid" as "nid", size: UID_BYTES },
      { name: "ts" as "ts", size: TS_BYTES },
      { name: "id" as "id", size: UID_BYTES },
      { name: "register" as "register", size: TS_BYTES + BOOL_BYTES },
    ],
  },
};
type ServerBinaryMessageObj = typeof serverBinaryMessageObj;
//#endregion

//#region Binary message types
/**
 * ## Binary message types from object
 *
 * Given a binary message object this type builds a type bindin each message code to the binary
 * components included in the message.
 */
type BinaryMessageTypes<T extends BinaryMessageObj> = {
  [key in keyof T]: {
    msgCode: key;
    components: {
      [compKey in T[key]["components"][number]["name"]]: Uint8Array;
    };
  };
};

/**
 * ## Client binary message
 *
 * Type specifying the components of a client-originated binary message based on the message code.
 * The message code is encoded as a discriminant byte leading the message.
 */
export type ClientBinaryMessage =
  BinaryMessageTypes<ClientBinaryMessageObj>[keyof ClientBinaryMessageObj];

/**
 * ## Server binary message
 *
 * Type specifying the components of a server-originated binary message based on the message code.
 * The message code is encoded as a discriminant byte leading the message.
 */
export type ServerBinaryMessage =
  BinaryMessageTypes<ServerBinaryMessageObj>[keyof ServerBinaryMessageObj];
//#endregion

//#region Binary message constructors/accessors
function buildBinaryMessage(
  binaryMessageObj: BinaryMessageObj,
  message: ClientBinaryMessage | ServerBinaryMessage
): Uint8Array {
  const messageObj = binaryMessageObj[message.msgCode];

  const layout = messageObj.components.map(c => c.size);
  const messageSize = layout.reduce((prev, curr) => prev + curr, 1);

  const binMessage = new Uint8Array(messageSize);
  binMessage.set(new Uint8Array([messageObj.discriminant]), 0);

  let currPosition = 1;
  messageObj.components.forEach((component, i) => {
    binMessage.set(
      message.components[component.name as keyof typeof message["components"]],
      currPosition
    );
    currPosition += layout[i];
  });
  return binMessage;
}

/**
 * ## Build client binary message
 *
 * Constructs a binary message from binary components based on a common specification
 * (order and size of the components).
 *
 * @param message Message with components
 * @returns Binary Message
 */
export function buildClientBinaryMessage(
  message: ClientBinaryMessage
): Uint8Array {
  return buildBinaryMessage(clientBinaryMessageObj, message);
}

/**
 * ## Build server binary message
 *
 * Constructs a binary message from binary components based on a common specification
 * (order and size of the components).
 *
 * @param message Message with components
 * @returns Binary Message
 */
export function buildServerBinaryMessage(
  message: ServerBinaryMessage
): Uint8Array {
  return buildBinaryMessage(serverBinaryMessageObj, message);
}

function parseBinaryMessage(
  binaryMessageObj: BinaryMessageObj,
  binMessage: Uint8Array
): { msgCode: string; components: Record<string, Uint8Array> } {
  const discriminant = binMessage[0];

  const entry = Object.entries(binaryMessageObj).find(
    ([_, v]) => v.discriminant === discriminant
  );

  if (!entry)
    throw `Invalid binary message. Unknown discriminant value ${discriminant}`;

  const [msgCode, val] = entry;

  const expectedSize = val.components
    .map(c => c.size as number)
    .reduce((prev, curr) => prev + curr, 1);

  if (binMessage.length !== expectedSize)
    throw `Invalid binary message. Size ${binMessage.length} doesn't match expected ${expectedSize}`;

  let currPosition = 1;
  const components: Record<string, Uint8Array> = {};
  for (const { name, size } of val.components) {
    components[name] = binMessage.slice(currPosition, currPosition + size);
    currPosition += size;
  }

  return { msgCode, components };
}

/**
 * ## Parse client binary message
 *
 * Extracts the message components from a binary message received from a client node.
 *
 * @param binMessage Binary client message
 * @returns binary components
 * @throws If the binary message is invalid.
 */
export function parseClientBinaryMessage(
  binMessage: Uint8Array
): ClientBinaryMessage {
  return parseBinaryMessage(
    clientBinaryMessageObj,
    binMessage
  ) as ClientBinaryMessage;
}

/**
 * ## Parse server binary message
 *
 * Extracts the message components from a binary message received from a server node.
 *
 * @param binMessage Binary server message
 * @returns binary components
 * @throws If the binary message is invalid.
 */
export function parseServerBinaryMessage(
  binMessage: Uint8Array
): ServerBinaryMessage {
  return parseBinaryMessage(
    serverBinaryMessageObj,
    binMessage
  ) as ServerBinaryMessage;
}

// export function parseClientBinaryMessage(
//   binMessage: Uint8Array
// ): ClientBinaryMessage {
//   const discriminant = binMessage[0];

//   const entry = Object.entries(clientBinaryMessageObj).find(
//     ([_, v]) => v.discriminant === discriminant
//   );

//   if (!entry)
//     throw `Invalid binary message. Unknown discriminant value ${discriminant}`;

//   const [msgCode, val] = entry;

//   const expectedSize = val.components
//     .map(c => c.size as number)
//     .reduce((prev, curr) => prev + curr, 1);

//   if (binMessage.length !== expectedSize)
//     throw `Invalid binary message. Size ${binMessage.length} doesn't match expected ${expectedSize}`;

//   let currPosition = 1;
//   const components: Record<string, Uint8Array> = {};
//   for (const { name, size } of val.components) {
//     components[name] = binMessage.slice(currPosition, currPosition + size);
//     currPosition += size;
//   }

//   return { msgCode, components } as unknown as ClientBinaryMessage;
// }
//#endregion
