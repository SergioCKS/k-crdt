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
    "node-id": {
        discriminant: 0,
        components: [{ name: "nid", size: UID_BYTES }],
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
//#region Binary message construction
/**
 * ## Build binary message
 *
 * Constructs a binary buffer for a single message.
 *
 * @param binaryMessageObj - Object specifying allowed message specifications
 * @param message - Message to encode
 * @returns - Encoded message
 */
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
 * ## Build binary message array
 *
 * Constructs a binary buffer for multiple messages.
 *
 * @param binaryMessageObj - Object specifying allowed message specifications
 * @param messages - Messages to encode
 * @returns - Buffer of messages
 */
function buildBinaryMessageArray(binaryMessageObj, messages) {
    const binMessages = messages.map(message => buildBinaryMessage(binaryMessageObj, message));
    const result = new Uint8Array(binMessages
        .map(binMessage => binMessage.length)
        .reduce((prev, curr) => prev + curr, 0));
    let currPosition = 0;
    for (const binMessage of binMessages) {
        result.set(binMessage, currPosition);
        currPosition += binMessage.length;
    }
    return result;
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
 * ## Build client binary messages
 *
 * Construct a binary buffer from multiple client messages.
 *
 * @param messages Messages to encode
 * @returns Buffer of encoded messages
 */
export function buildClientBinaryMessageArray(messages) {
    return buildBinaryMessageArray(clientBinaryMessageObj, messages);
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
/**
 * ## Build server binary message array
 *
 * Constructs a binary buffer from multiple server messages.
 *
 * @param messages - Messages to encode
 * @returns - Buffer of encoded messages
 */
export function buildServerBinaryMessageArray(messages) {
    return buildBinaryMessageArray(serverBinaryMessageObj, messages);
}
//#endregion
//#region Binary message parsing
/**
 * ## Parse binary message
 *
 * Parses one message from a binary buffer.
 *
 * @param binaryMessageObj Message object specifying the possible messages
 * @param binMessage - Buffer of one message
 * @returns Parsed message + Rest of the buffer
 */
function parseBinaryMessage(binaryMessageObj, binMessage) {
    const [msgCode, val] = Object.entries(binaryMessageObj).find(([_, v]) => v.discriminant === binMessage[0]);
    let currPosition = 1;
    const components = {};
    for (const { name, size } of val.components) {
        components[name] = binMessage.slice(currPosition, currPosition + size);
        currPosition += size;
    }
    return [
        { msgCode, components },
        binMessage.slice(currPosition),
    ];
}
/**
 * ## Parse binary message array
 *
 * Parses one or more messages from a binary buffer
 *
 * @param binaryMessageObj Message object specifying the possible messages
 * @param binMessageArray - Buffer of one or more binary messages
 * @returns - Array of parsed messages
 */
function parseBinaryMessageArray(binaryMessageObj, binMessageArray) {
    let remaining = binMessageArray;
    const result = [];
    while (binMessageArray.length > 0) {
        const [message, rest] = parseBinaryMessage(binaryMessageObj, remaining);
        result.push(message);
        remaining = rest;
    }
    return result;
}
/**
 * ## Parse client binary message
 *
 * Extracts the message components from a binary buffer for multiple client messages.
 *
 * @param binMessageArray - Binary buffer for the messages
 * @returns - Parsed client messages
 */
export function parseClientBinaryMessageArray(binMessageArray) {
    return parseBinaryMessageArray(clientBinaryMessageObj, binMessageArray);
}
/**
 * ## Parse client binary message
 *
 * Extracts the message components from a binary buffer for a single encoded client message.
 *
 * @param binMessage - Binary buffer for the message
 * @returns Parsed client message
 */
export function parseClientBinaryMessage(binMessage) {
    return parseBinaryMessage(clientBinaryMessageObj, binMessage)[0];
}
/**
 * ## Parse server binary message
 *
 * Extracts the message components from a binary buffer for multiple server messages.
 *
 * @param binMessageArray - Binary buffer for the messages
 * @returns - Parsed server messages
 */
export function parseServerBinaryMessageArray(binMessageArray) {
    return parseBinaryMessage(serverBinaryMessageObj, binMessageArray);
}
/**
 * ## Parse server binary message
 *
 * Extracts the message components from a binary buffer for a single server message.
 *
 * @param binMessage - Binary buffer for the message
 * @returns Parsed server message
 */
export function parseServerBinaryMessage(binMessage) {
    return parseBinaryMessage(serverBinaryMessageObj, binMessage)[0];
}
//#endregion
