<!--
	# Main Layout

	Layout wrapping all components in the application.

	* As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup the callbacks for messages from the web worker.

	@module
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { initialized, registers } from "../stores/engine";
	import { offline, serviceWorkerSupported, messageWorker } from "../stores/general";
	import type { AppMessage, WorkerMessage } from "$types/messages";

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

		workerContainer.ready.then((registration) => {
			const worker = registration.active;
			// 3. Establish channel to worker for other components to use.
			$messageWorker = (message: AppMessage) => {
				worker.postMessage(message);
			};
			// 4. Send initialization message, as soon as the worker becomes active.
			worker.addEventListener("statechange", () => {
				if (worker.state === "activated") {
					$messageWorker({ msgCode: "initialize" });
				}
			});
		});
	});
</script>

{#if !$serviceWorkerSupported}
	Your browser does not support service workers.
{:else}
	<slot />
{/if}
