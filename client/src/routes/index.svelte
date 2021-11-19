<script lang="ts">
	import { AppMessage, AppMessageCode } from "$types/messages";

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
		swRegistration?.active.postMessage(message);
	}

	function test() {
		messageWorker({
			msgCode: AppMessageCode.Test,
			payload: { value: "test" }
		});
	}
	function createBoolRegister() {
		messageWorker({
			msgCode: AppMessageCode.CreateBoolRegister,
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
<button on:click={test}>Test</button>
<button on:click={createBoolRegister}>Create boolean register</button>
Offline: {$offline}
{JSON.stringify($registers)}
