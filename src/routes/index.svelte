<script lang="ts">
	import { nodeId } from "../stores/engine";

	async function printWasm() {
		const registration = await navigator.serviceWorker.ready;

		registration.active.postMessage({
			msgCode: "get-node-id"
		});
	}
</script>

<button on:click={printWasm}>Print WASM</button>
Node ID: {$nodeId}
