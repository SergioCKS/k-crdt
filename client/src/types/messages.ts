/**
 * ## Client message
 *
 * Message data from a client-originated event.
 */
export interface ClientMessage {
	msgCode: ClientMessageCode;
	payload?: Record<string, unknown>;
}

/**
 * ## Worker message
 *
 * Message data from a worker-originated event.
 */
export interface WorkerMessage {
	msgCode: WorkerMessageCode;
	payload?: Record<string, unknown>;
}

/**
 * ## Client message code
 *
 * Allowed codes for client messages.
 */
export enum ClientMessageCode {
	Initialize,
	Test,
	UpdateTimeOffset,
	NoSyncConnection,
	CreateBoolRegister,
	RestoreRegisters
}

/**
 * ## Worker message code
 *
 * Allowed codes for worker messages.
 */
export enum WorkerMessageCode {
	Initialized,
	TimeOffsetValue,
	RetrieveTimeOffset,
	OfflineValue,
	NewRegister,
	RestoredRegisters
}

/**
 * ## Messages requiring Wasm
 *
 * List of message codes corresponding to messages that require the Wasm interface to be initialized to be handled.
 */
export const requireWasm: ClientMessageCode[] = [
	ClientMessageCode.CreateBoolRegister,
	ClientMessageCode.UpdateTimeOffset
];
