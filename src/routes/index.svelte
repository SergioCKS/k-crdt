<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, counterValue, initialized } from "../stores/engine";

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
	function serializeCounter() {
		swRegistration?.active.postMessage({
			msgCode: "serialize-counter"
		});
	}

	onMount(async () => {
		swRegistration = await navigator.serviceWorker.ready;
	});
</script>

{#if !$initialized}
	Initializing ...
{/if}
<button on:click={printWasm}>Print WASM</button>
<button on:click={incrementCounter}>Increment Counter</button>
<button on:click={serializeCounter}>Serialize Counter</button>
Node ID: {$nodeId}
Counter: {$counterValue}
