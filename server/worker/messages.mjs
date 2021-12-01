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
const TS_BYTES = 8;
const UID_BYTES = 16;
const BOOL_BYTES = 1;
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
        discriminant: 0,
        components: [{ name: "payload", size: UID_BYTES }],
    },
    "bool-register": {
        discriminant: 1,
        components: [
            { name: "ts", size: TS_BYTES },
            { name: "id", size: UID_BYTES },
            { name: "register", size: TS_BYTES + BOOL_BYTES },
        ],
    },
};
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
        discriminant: 1,
        components: [
            { name: "nid", size: UID_BYTES },
            { name: "ts", size: TS_BYTES },
            { name: "id", size: UID_BYTES },
            { name: "register", size: TS_BYTES + BOOL_BYTES },
        ],
    },
};
//#endregion
//#region Binary message constructors/accessors
function buildBinaryMessage(binaryMessageObj, message) {
    const messageObj = binaryMessageObj[message.msgCode];
    const layout = messageObj.components.map(c => c.size);
    const messageSize = layout.reduce((prev, curr) => prev + curr, 1);
    const binMessage = new Uint8Array(messageSize);
    binMessage.set(new Uint8Array([messageObj.discriminant]), 0);
    let currPosition = 1;
    messageObj.components.forEach((component, i) => {
        binMessage.set(message.components[component.name], currPosition);
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
export function buildClientBinaryMessage(message) {
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
export function buildServerBinaryMessage(message) {
    return buildBinaryMessage(serverBinaryMessageObj, message);
}
function parseBinaryMessage(binaryMessageObj, binMessage) {
    const discriminant = binMessage[0];
    const entry = Object.entries(binaryMessageObj).find(([_, v]) => v.discriminant === discriminant);
    if (!entry)
        throw `Invalid binary message. Unknown discriminant value ${discriminant}`;
    const [msgCode, val] = entry;
    const expectedSize = val.components
        .map(c => c.size)
        .reduce((prev, curr) => prev + curr, 1);
    if (binMessage.length !== expectedSize)
        throw `Invalid binary message. Size ${binMessage.length} doesn't match expected ${expectedSize}`;
    let currPosition = 1;
    const components = {};
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
export function parseClientBinaryMessage(binMessage) {
    return parseBinaryMessage(clientBinaryMessageObj, binMessage);
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
export function parseServerBinaryMessage(binMessage) {
    return parseBinaryMessage(serverBinaryMessageObj, binMessage);
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
