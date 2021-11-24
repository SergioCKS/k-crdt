<script lang="ts">
	import {
		AppMessage,
		AppMessageCode,
		AppMessagePayload,
		NewRegisterPayload
	} from "$types/messages";
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

	/**
	 * ## Create bool register
	 *
	 * Send a message to the web worker to create a new register with boolean value.
	 *
	 * @param payload - Payload of the message
	 */
	function createBoolRegister(initialValue: boolean) {
		messageWorker({
			msgCode: AppMessageCode.CreateBoolRegister,
			payload: { value: initialValue }
		});
	}

	function test() {
		messageWorker({ msgCode: AppMessageCode.Test });
	}

	onMount(async () => {
		swRegistration = await navigator.serviceWorker.ready;
	});
</script>

{#if !$initialized}
	Initializing ...
{/if}
<button on:click={test}>Test</button>
<button on:click={() => createBoolRegister(false)}>Create boolean register</button>
Offline: {$offline}
{JSON.stringify($registers)}
