<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, counterValue, registerValue, initialized } from "../stores/engine";

	let swRegistration: ServiceWorkerRegistration;

	function printWasm() {
		swRegistration?.active.postMessage({
			msgCode: "get-node-id"
		});
	}
	function incrementCounter() {
		swRegistration?.active.postMessage({
			msgCode: "increment-counter"
		});
	}
	function decrementCounter() {
		swRegistration?.active.postMessage({
			msgCode: "decrement-counter"
		});
	}
	function toggleRegister() {
		swRegistration?.active.postMessage({
			msgCode: "toggle-register"
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
<button on:click={decrementCounter}>Decrement Counter</button>
<button on:click={toggleRegister}>Toggle Register</button>
Node ID: {$nodeId}
Counter: {$counterValue}
Register: {$registerValue}
