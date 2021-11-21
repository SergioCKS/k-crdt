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
 * as such, they are copied to the corresponding places on the dependency build step.
 * @module
 */

/**
 * ## Message
 *
 * Generic message.
 */
interface Message {
  msgCode: string;
  payload?: Record<string, unknown>;
}

/**
 * ## App message
 *
 * Message data from an app-originated event.
 */
export interface AppMessage extends Message {
  msgCode: AppMessageCode;
}

/**
 * ## Worker message
 *
 * Message data from a worker-originated event.
 */
export interface WorkerMessage extends Message {
  msgCode: WorkerMessageCode;
}

/**
 * ## Client message
 *
 * Message data from a client-originated event.
 */
export interface ClientMessage extends Message {
  msgCode: ClientMessageCode;
}

/**
 * ## Server message
 *
 * Message data from a server-originated event.
 */
export interface ServerMessage extends Message {
  msgCode: ServerMessageCode;
}

/**
 * ## App message code
 *
 * Allowed codes for app-originated messages.
 */
export enum AppMessageCode {
  Initialize = "initialize",
  Test = "test",
  UpdateTimeOffset = "update-time-offset",
  NoSyncConnection = "no-sync-connection",
  CreateBoolRegister = "create-bool-register",
  RestoreRegisters = "restore-registers",
}

/**
 * ## Worker message code
 *
 * Allowed codes for worker-originated messages.
 */
export enum WorkerMessageCode {
  Initialized = "initialized",
  OfflineValue = "offline-value",
  NewRegister = "new-register",
  RestoredRegisters = "restored-registers",
}

/**
 * ## Client message code
 *
 * Allowed codes for client-originated message.
 */
export enum ClientMessageCode {
  TimeSync = "time-sync",
  Test = "test",
}

/**
 * ## Server message code
 *
 * Allowed codes for server-originated messages.
 */
export enum ServerMessageCode {
  TimeSync = "time-sync",
  Test = "test",
}

/**
 * ## Messages requiring Wasm
 *
 * List of message codes corresponding to messages that require the Wasm interface to be initialized to be handled.
 */
export const requireWasm: AppMessageCode[] = [
  AppMessageCode.CreateBoolRegister,
  AppMessageCode.UpdateTimeOffset,
];
