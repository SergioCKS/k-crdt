<!--
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the web worker.

	@module
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { initialized, registers } from "../stores/engine";
	import { offline, serviceWorkerSupported } from "../stores/general";
	import type { AppMessage, WorkerMessage } from "$types/messages";

	/**
	 * ## Service worker registration
	 *
	 * * Set on app mount.
	 */
	let workerRegistration: ServiceWorkerRegistration | undefined = undefined;

	/**
	 * ## Message worker
	 *
	 * Send a message to the web worker.
	 *
	 * @param message - Message to send.
	 */
	function messageWorker(message: AppMessage) {
		workerRegistration?.active?.postMessage(message);
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
				console.log("initialized");
				// if (!$initialized) messageWorker({ msgCode: "restore-registers" });
				$initialized = true;
				return true;
			}
			case "offline-value": {
				$offline = message.payload.value;
				return true;
			}
			//#region new-register
			// case "new-register": {
			// 	let { id, value, type } = message.payload;
			// 	$registers[id] = { value, type };
			// 	return true;
			// }
			//#endregion
			case "restored-registers": {
				$registers = message.payload.value;
				return true;
			}
		}
	}

	/**
	 * ## App initialization code
	 *
	 * Code run on app initialization regardless of the route being accessed.
	 *
	 * * Checks if the browser supports message workers.
	 * * Sets up handler for worker messages.
	 * * Sends an initialization message when the worker becomes active.
	 *
	 */
	onMount(() => {
		//#region 1. Check if the browser supports service workers.
		if (!("serviceWorker" in navigator)) {
			$serviceWorkerSupported = false;
			console.error("Service worker not supported by the browser.");
			return;
		}
		//#endregion

		const workerContainer = navigator.serviceWorker;

		//#region 2. Attach message handler.
		workerContainer.addEventListener("message", ({ data }) => {
			try {
				handleWorkerMessage(data);
			} catch (error) {
				console.error("Error while handling worker event.", error);
			}
		});
		//#endregion

		//#region 3. Send initialization message, as soon as the worker becomes active.
		workerContainer.ready.then((registration) => {
			workerRegistration = registration;
			const worker = registration.active;
			worker.addEventListener("statechange", () => {
				if (worker.state === "activated") {
					messageWorker({ msgCode: "initialize" });
				}
			});
		});
		//#endregion
	});
</script>

{#if $serviceWorkerSupported}
	<slot />
{:else}
	Your browser does not support service workers.
{/if}
