<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, initialized } from "../stores/engine";
	import { offline } from "../stores/general";

	let swRegistration: ServiceWorkerRegistration;

	function testClock() {
		swRegistration?.active.postMessage({
			msgCode: "test-clock",
			payload: { value: "test" }
		});
	}

	onMount(async () => {
		swRegistration = await navigator.serviceWorker.ready;
	});
</script>

{#if !$initialized}
	Initializing ...
{/if}
<button on:click={testClock}>Test clock</button>
Node ID: {$nodeId}
Offline: {$offline}
