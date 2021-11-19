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
	import {
		WorkerMessage,
		ClientMessageCode,
		WorkerMessageCode,
		ClientMessage
	} from "$types/messages";

	/**
	 * ## Service worker registration
	 *
	 * * Set on app mount.
	 */
	let registration: ServiceWorkerRegistration = undefined;

	/**
	 * ## Message worker
	 *
	 * Send a message to the web worker.
	 *
	 * @param message - Message to send.
	 */
	function messageWorker(message: ClientMessage) {
		registration?.active.postMessage(message);
	}

	/**
	 * ## Handle worker message
	 *
	 * Handles an incoming message from the web worker.
	 *
	 * @param msgCode - Code of the message.
	 * @param payload - Payload of the message.
	 */
	function handleWorkerMessage(
		msgCode: WorkerMessageCode,
		payload: Record<string, unknown>
	): boolean {
		switch (msgCode) {
			case WorkerMessageCode.Initialized: {
				if (!$initialized) messageWorker({ msgCode: ClientMessageCode.RestoreRegisters });
				$initialized = true;
				return true;
			}
			case WorkerMessageCode.TimeOffsetValue: {
				const updatedOffset = payload.value as number;
				localStorage.setItem("TIME_OFFSET", updatedOffset.toString());
				return true;
			}
			case WorkerMessageCode.OfflineValue: {
				$offline = payload.value as boolean;
				return true;
			}
			case WorkerMessageCode.RetrieveTimeOffset: {
				const offset = localStorage.getItem("TIME_OFFSET");
				if (offset) {
					messageWorker({
						msgCode: ClientMessageCode.UpdateTimeOffset,
						payload: { value: Number.parseInt(offset) }
					});
				}
				return true;
			}
			case WorkerMessageCode.NewRegister: {
				let { id, value, type } = payload as { id: string; value: boolean; type: string };
				$registers[id] = { value, type };
				return true;
			}
			case WorkerMessageCode.RestoredRegisters: {
				$registers = payload.value;
				return true;
			}
		}
	}

	onMount(async () => {
		// Attach message handler.
		navigator.serviceWorker.addEventListener("message", (event) => {
			const msgData = event.data as WorkerMessage;
			handleWorkerMessage(msgData.msgCode, msgData.payload);
		});

		registration = await navigator.serviceWorker.ready;

		//#region Send initialization message when the worker is `active`
		const worker = registration.active;
		if (worker.state === "activated") {
			messageWorker({ msgCode: ClientMessageCode.Initialize });
		} else {
			worker.addEventListener("statechange", () => {
				if (worker.state === "activated") {
					messageWorker({ msgCode: ClientMessageCode.Initialize });
				}
			});
		}
		//#endregion
	});
</script>

<slot />
