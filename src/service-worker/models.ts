export interface MsgData {
	msgCode: "create-gcounter" | "print-gcounter";
	payload: Record<string, unknown>;
}
