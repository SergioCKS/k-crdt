<script lang="ts">
	import { onMount } from "svelte";
	import { nodeId, initialized, registers } from "../stores/engine";
	import { offline } from "../stores/general";

	let swRegistration: ServiceWorkerRegistration;

	function testClock() {
		swRegistration?.active.postMessage({
			msgCode: "test-clock",
			payload: { value: "test" }
		});
	}
	function createBoolRegister() {
		swRegistration?.active.postMessage({
			msgCode: "create-bool-register",
			payload: { value: false }
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
<button on:click={createBoolRegister}>Create boolean register</button>
Node ID: {$nodeId}
Offline: {$offline}
{JSON.stringify($registers)}
