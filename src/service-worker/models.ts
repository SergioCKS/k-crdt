export interface MsgData {
	msgCode: "create-gcounter" | "print-gcounter" | "get-node-id";
	payload: Record<string, unknown>;
}
