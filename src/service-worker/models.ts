export interface MsgData {
	msgCode: string;
	payload: Record<string, unknown>;
}

export interface ClientMsgData extends MsgData {
	msgCode:
		| "create-gcounter"
		| "get-gcounter-value"
		| "get-node-id"
		| "increment-gcounter"
		| "initialize";
}

export interface SwMsgData extends MsgData {
	msgCode: "node-id" | "counter-value";
}
