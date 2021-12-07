<script lang="ts">
	import type { AppMessage } from "$types/messages";
	import { onMount } from "svelte";
	import { initialized, registers } from "../stores/engine";
	import { offline } from "../stores/general";

	let swRegistration: ServiceWorkerRegistration;

	/**
	 * ## Message worker
	 *
	 * Send a message to the web worker.
	 *
	 * @param message - Message to send.
	 */
	function messageWorker(message: AppMessage) {
		swRegistration?.active?.postMessage(message);
	}

	function test() {
		messageWorker({ msgCode: "test" });
	}

	function newRecord() {
		console.log("TODO: Create new record.");
	}

	onMount(async () => {
		swRegistration = await navigator.serviceWorker.ready;
	});
</script>

{#if !$initialized}
	Initializing ...
{:else}
	<button on:click={test}>Test</button>
	<button on:click={newRecord}>New Record</button>
	Offline: {$offline}
	{JSON.stringify($registers)}
{/if}
