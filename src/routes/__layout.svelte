<!-- @module
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the service worker.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, counterValue, initialized } from "../stores/engine";
	import type { SwMsgData } from "../service-worker/models";

	let registration: ServiceWorkerRegistration;

	onMount(async () => {
		navigator.serviceWorker.addEventListener("message", (event) => {
			const msgData = event.data as SwMsgData;
			// Engine initialized
			if (msgData.msgCode === "initialized") {
				$initialized = true;
				registration.active.postMessage({
					msgCode: "get-gcounter-value"
				});
			}
			// Incoming node ID
			if (msgData.msgCode === "node-id") {
				$nodeId = msgData.payload.nodeId as string;
			}
			// Incoming counter value
			if (msgData.msgCode === "counter-value") {
				$counterValue = msgData.payload.value as number;
			}
		});

		registration = await navigator.serviceWorker.ready;

		//#region Send initialization message when the worker is `active`
		const worker = registration.active;
		if (worker.state === "activated") {
			worker.postMessage({ msgCode: "initialize" });
		} else {
			worker.addEventListener("statechange", () => {
				if (worker.state === "activated") {
					worker.postMessage({ msgCode: "initialize" });
				}
			});
		}
		//#endregion
	});
</script>

<slot />
