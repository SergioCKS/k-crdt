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
		| "initialize"
		| "incoming-update";
}

export interface SwMsgData extends MsgData {
	msgCode: "initialized" | "node-id" | "counter-value" | "error";
}
