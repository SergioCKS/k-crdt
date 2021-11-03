export interface MsgData {
	msgCode: string;
	payload?: Record<string, unknown>;
}

export interface ClientMsgData extends MsgData {
	msgCode:
		| "create-gcounter"
		| "get-gcounter-value"
		| "get-node-id"
		| "increment-counter"
		| "decrement-counter"
		| "toggle-register"
		| "test-clock"
		| "initialize"
		| "incoming-update"
		| "incoming-register-update"
		| "update-time-offset";
}

export interface SwMsgData extends MsgData {
	msgCode:
		| "initialized"
		| "node-id"
		| "counter-value"
		| "register-value"
		| "time-offset-value"
		| "error";
}
