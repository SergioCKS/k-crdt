<script lang="ts">
	import { ClientMessage, ClientMessageCode } from "$types/messages";

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
	function messageWorker(message: ClientMessage) {
		swRegistration?.active.postMessage(message);
	}

	function test() {
		messageWorker({
			msgCode: ClientMessageCode.Test,
			payload: { value: "test" }
		});
	}
	function createBoolRegister() {
		messageWorker({
			msgCode: ClientMessageCode.CreateBoolRegister,
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
