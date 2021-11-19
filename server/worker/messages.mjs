/**
 * # Message types
 *
 * Unified message interface for event handling throughout the system.
 *
 * The following connections are modeled:
 *
 * * App <-> Worker (Via DOM events)
 * * Client <-> Server (Via WebSockets)
 * @module
 */
/**
 * ## App message code
 *
 * Allowed codes for app-originated messages.
 */
export var AppMessageCode;
(function (AppMessageCode) {
    AppMessageCode["Initialize"] = "initialize";
    AppMessageCode["Test"] = "test";
    AppMessageCode["UpdateTimeOffset"] = "update-time-offset";
    AppMessageCode["NoSyncConnection"] = "no-sync-connection";
    AppMessageCode["CreateBoolRegister"] = "create-bool-register";
    AppMessageCode["RestoreRegisters"] = "restore-registers";
})(AppMessageCode || (AppMessageCode = {}));
/**
 * ## Worker message code
 *
 * Allowed codes for worker-originated messages.
 */
export var WorkerMessageCode;
(function (WorkerMessageCode) {
    WorkerMessageCode["Initialized"] = "initialized";
    WorkerMessageCode["TimeOffsetValue"] = "time-offset-value";
    WorkerMessageCode["RetrieveTimeOffset"] = "retrieve-time-offset";
    WorkerMessageCode["OfflineValue"] = "offline-value";
    WorkerMessageCode["NewRegister"] = "new-register";
    WorkerMessageCode["RestoredRegisters"] = "restored-registers";
})(WorkerMessageCode || (WorkerMessageCode = {}));
/**
 * ## Client message code
 *
 * Allowed codes for client-originated message.
 */
export var ClientMessageCode;
(function (ClientMessageCode) {
    ClientMessageCode["TimeSync"] = "time-sync";
    ClientMessageCode["Test"] = "test";
})(ClientMessageCode || (ClientMessageCode = {}));
/**
 * ## Server message code
 *
 * Allowed codes for server-originated messages.
 */
export var ServerMessageCode;
(function (ServerMessageCode) {
    ServerMessageCode["TimeSync"] = "time-sync";
    ServerMessageCode["Test"] = "test";
})(ServerMessageCode || (ServerMessageCode = {}));
/**
 * ## Messages requiring Wasm
 *
 * List of message codes corresponding to messages that require the Wasm interface to be initialized to be handled.
 */
export const requireWasm = [
    AppMessageCode.CreateBoolRegister,
    AppMessageCode.UpdateTimeOffset,
];
