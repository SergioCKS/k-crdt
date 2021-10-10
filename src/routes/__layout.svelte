<!-- @module
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the service worker.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId } from "../stores/engine";

	onMount(() => {
		navigator.serviceWorker.addEventListener("message", (event) => {
			const msgData = event.data;
			if (msgData.msgCode === "node-id") {
				$nodeId = msgData.payload.nodeId;
			}
		});
	});
</script>

<slot />
