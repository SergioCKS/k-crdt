<!--
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the web worker.

	@module
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { initialized, registers } from "../stores/engine";
	import { offline } from "../stores/general";
	import type { AppMessage, WorkerMessage } from "$types/messages";

	/**
	 * ## Service worker registration
	 *
	 * * Set on app mount.
	 */
	let registration: ServiceWorkerRegistration | undefined = undefined;

	/**
	 * ## Message worker
	 *
	 * Send a message to the web worker.
	 *
	 * @param message - Message to send.
	 */
	function messageWorker(message: AppMessage) {
		registration?.active?.postMessage(message);
	}

	/**
	 * ## Handle worker message
	 *
	 * Handles an incoming message from the web worker.
	 *
	 * @param msgCode - Code of the message.
	 * @param payload - Payload of the message.
	 */
	function handleWorkerMessage(message: WorkerMessage): boolean {
		switch (message.msgCode) {
			case "initialized": {
				if (!$initialized) messageWorker({ msgCode: "restore-registers" });
				$initialized = true;
				return true;
			}
			case "offline-value": {
				$offline = message.payload.value;
				return true;
			}
			case "new-register": {
				let { id, value, type } = message.payload;
				$registers[id] = { value, type };
				return true;
			}
			case "restored-registers": {
				$registers = message.payload.value;
				return true;
			}
		}
	}

	onMount(async () => {
		// Attach message handler.
		navigator.serviceWorker.addEventListener("message", ({ data: message }) => {
			try {
				handleWorkerMessage(message);
			} catch (error) {
				console.error("Error while handling worker event.", error);
			}
		});

		registration = await navigator.serviceWorker.ready;

		//#region Send initialization message when the worker is `active`
		const worker = registration.active;
		if (worker?.state === "activated") {
			messageWorker({ msgCode: "initialize" });
		} else {
			worker?.addEventListener("statechange", () => {
				if (worker.state === "activated") {
					messageWorker({ msgCode: "initialize" });
				}
			});
		}
		//#endregion
	});
</script>

<slot />
