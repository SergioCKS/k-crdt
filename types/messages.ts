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

//#region App message
export type AppMessage =
  | CreateBoolRegisterMessage
  | TestMessage
  | InitializeMessage
  | UpdateTimeOffsetMessage
  | NoSyncConnectionMessage
  | RestoreRegistersMessage;

interface InitializeMessage {
  msgCode: AppMessageCode.Initialize;
}

interface UpdateTimeOffsetMessage {
  msgCode: AppMessageCode.UpdateTimeOffset;
  payload: { value: number };
}

interface NoSyncConnectionMessage {
  msgCode: AppMessageCode.NoSyncConnection;
}

interface RestoreRegistersMessage {
  msgCode: AppMessageCode.RestoreRegisters;
}

interface CreateBoolRegisterMessage {
  msgCode: AppMessageCode.CreateBoolRegister;
  payload: { value: boolean };
}

interface TestMessage {
  msgCode: AppMessageCode.Test;
}
//#endregion

//#region Worker message
export type WorkerMessage =
  | InitializedMessage
  | OfflineValueMessage
  | NewRegisterMessage
  | RestoredRegistersMessage;

interface InitializedMessage {
  msgCode: WorkerMessageCode.Initialized;
}

interface OfflineValueMessage {
  msgCode: WorkerMessageCode.OfflineValue;
  payload: { value: boolean };
}

interface NewRegisterMessage {
  msgCode: WorkerMessageCode.NewRegister;
  payload: {
    id: string;
    value: boolean;
    type: "bool";
  };
}

interface RestoredRegistersMessage {
  msgCode: WorkerMessageCode.RestoredRegisters;
  payload: { value: Record<string, unknown> };
}
//#endregion

//#region Client message
export type ClientMessage = ClientTimeSyncMessage | ClientTestMessage;

interface ClientTimeSyncMessage {
  msgCode: ClientMessageCode.TimeSync;
  payload: TimeSyncPollRequestPayload;
}

interface ClientTestMessage {
  msgCode: ClientMessageCode.Test;
}
//#endregion

//#region Server message
export type ServerMessage = ServerTimeSyncMessage | ServerTestMessage;

interface ServerTimeSyncMessage {
  msgCode: ServerMessageCode.TimeSync;
  payload: TimeSyncPayload;
}

interface ServerTestMessage {
  msgCode: ServerMessageCode.Test;
  payload: any;
}
//#endregion

//#region Message
/**
 * ## Message
 *
 * Generic message interface.
 */
interface Message {
  msgCode: string;
  payload?: MessagePayload;
}

/**
 * ## App message
 *
 * Message data from an app-originated event.
 */
export interface AppMessage2 extends Message {
  msgCode: AppMessageCode;
  payload?: MessagePayload & AppMessagePayload;
}

/**
 * ## Worker message
 *
 * Message data from a worker-originated event.
 */
export interface WorkerMessage2 extends Message {
  msgCode: WorkerMessageCode;
  payload?: WorkerMessagePayload;
}

/**
 * ## Client message
 *
 * Message data from a client-originated event.
 */
export interface ClientMessage2 extends Message {
  msgCode: ClientMessageCode;
  payload?: ClientMessagePayload;
}

/**
 * ## Server message
 *
 * Message data from a server-originated event.
 */
export interface ServerMessage2 extends Message {
  msgCode: ServerMessageCode;
  payload: ServerMessagePayload;
}
//#endregion

//#region Message code
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
//#endregion

//#region Message payload
/**
 * ## Message payload
 *
 * Generic message payload.
 */
export interface MessagePayload {}

/**
 * ## App message payload
 *
 * Groups payload interfaces of app messages.
 */
export interface AppMessagePayload extends MessagePayload {}

/**
 * ## Worker message payload
 *
 * Groups payload interfaces of worker messages.
 */
export interface WorkerMessagePayload extends MessagePayload {}

/**
 * ## Client message payload
 *
 * Groups payload interfaces of client messages.
 */
export interface ClientMessagePayload extends MessagePayload {}

/**
 * ## Server message payload
 *
 * Groups payload interfaces of server messages.
 */
export interface ServerMessagePayload extends MessagePayload {}
//#endregion

//#region Specific payload types

/**
 * ## Payload for `NewRegister` worker message
 */
export interface NewRegisterPayload extends WorkerMessagePayload {
  /**
   * ### Initial value of the register
   */
  value: boolean;
}

/**
 * ## Payload for `UpdateTimeOffset` app message
 */
export interface UpdateTimeOffsetPayload extends AppMessagePayload {
  /**
   * ### New time offset.
   */
  value: number;
}

/**
 * ## Time sync for `TimeSync` server message
 */
export interface TimeSyncPayload extends ServerMessagePayload {
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

type TimeSyncPollRequestPayload = {
  t0: number;
};
//#endregion

/**
 * ## Messages requiring Wasm
 *
 * List of message codes corresponding to messages that require the Wasm interface to be initialized to be handled.
 */
export const requireWasm: AppMessageCode[] = [
  AppMessageCode.CreateBoolRegister,
  AppMessageCode.UpdateTimeOffset,
  AppMessageCode.Test,
];
