<!-- @module
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the service worker.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, counterValue } from "../stores/engine";
	import type { SwMsgData } from "../service-worker/models";

	onMount(async () => {
		navigator.serviceWorker.addEventListener("message", (event) => {
			const msgData = event.data as SwMsgData;
			// Incoming node ID
			if (msgData.msgCode === "node-id") {
				$nodeId = msgData.payload.nodeId as string;
			}
			// Incoming counter value
			if (msgData.msgCode === "counter-value") {
				$counterValue = msgData.payload.value as number;
			}
		});

		const registration = await navigator.serviceWorker.ready;
		registration.active.postMessage({
			msgCode: "get-gcounter-value"
		});
	});
</script>

<slot />
