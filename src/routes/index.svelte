<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, counterValue } from "../stores/engine";

	let swRegistration: ServiceWorkerRegistration;

	function printWasm() {
		swRegistration?.active.postMessage({
			msgCode: "get-node-id"
		});
	}
	function incrementCounter() {
		swRegistration?.active.postMessage({
			msgCode: "increment-gcounter"
		});
	}

	onMount(async () => {
		swRegistration = await navigator.serviceWorker.ready;
	});
</script>

<button on:click={printWasm}>Print WASM</button>
<button on:click={incrementCounter}>Increment Counter</button>
Node ID: {$nodeId}
Counter: {$counterValue}
