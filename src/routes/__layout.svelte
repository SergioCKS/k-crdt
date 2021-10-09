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
