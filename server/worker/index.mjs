import { get_message } from "./engine_bg.mjs";
export * from "./engine_bg.mjs";
export { SyncAgent } from "./sync_agent.mjs";
export default {
    async fetch(request, env) {
        return await handleRequest(request, env);
    },
};
async function handleRequest(request, env) {
    try {
        const url = new URL(request.url);
        if (url.pathname == "/ws") {
            const durObj = env.SYNC_AGENT.get(env.SYNC_AGENT.idFromName("SOME"));
            return await durObj.fetch(request);
        }
        else {
            return new Response(get_message());
        }
    }
    catch {
        return new Response("Error");
    }
}
