<!--
	# Main Layout

	Layout wrapping all components in the application.

	As the `onMount` callback of the main layout is run regardless of the page visited, it is used to setup application-level functionality:

	* Application-level style definitions.
	* Preloading of icons and fonts.
	* Sets up the communication channel between the application and the web worker.
	* Dark/light mode based on the user's preferred settings.
	

	The main layout also wraps contents with a navigation bar.

	@module
-->
<script lang="ts">
	import "uno.css";
	import "$src/app.css";
	import { onMount } from "svelte";
	import { dev } from "$app/env";
	import { initialized, registers } from "../stores/engine";
	import {
		offline,
		serviceWorkerSupported,
		messageWorker,
		darkMode,
		desktopSidebarCollapsed,
		userMenuOpen,
		mobileSidebarOpen
	} from "../stores/general";
	import type { AppMessage, WorkerMessage } from "$types/messages";
	import Navbar from "$components/Navbar.svelte";
	import Sidebar from "$src/components/Sidebar.svelte";
	import UserMenu from "$components/UserMenu.svelte";

	$: marginLeft = $desktopSidebarCollapsed ? "sm:ml-14" : "sm:ml-60";

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
	 * * Set up light/dark mode based on user settings.
	 * * Sets up UnoCSS utilities for the body element.
	 * * Sets up dummy backend for development mode.
	 * * Checks if the browser supports message workers.
	 * * Sets up handler for worker messages.
	 * * Establish channel to worker for other components.
	 * * Sends an initialization message when the worker becomes active.
	 */
	onMount(() => {
		const dummyWorker = {
			postMessage(message: AppMessage): boolean {
				switch (message.msgCode) {
					case "initialize": {
						handleWorkerMessage({ msgCode: "initialized" });
						return true;
					}
					case "test": {
						console.log("TEST");
						return true;
					}
					case "update-time-offset": {
						return true;
					}
					case "no-sync-connection": {
						handleWorkerMessage({ msgCode: "offline-value", payload: { value: true } });
						return true;
					}
					case "update-bool-register": {
						return true;
					}
				}
			}
		};

		//#region 1. Set up light/dark mode based on the user settings.
		function matchDarkMode(e: MediaQueryListEvent | MediaQueryList) {
			const rootElement = document.documentElement;
			if (e.matches) {
				rootElement.classList.remove("light");
				rootElement.classList.add("dark");
				$darkMode = true;
			} else {
				rootElement.classList.remove("dark");
				rootElement.classList.add("light");
				$darkMode = false;
			}
		}
		matchDarkMode(window.matchMedia("(prefers-color-scheme: dark)"));
		window.matchMedia("(prefers-color-scheme: dark)").addListener(matchDarkMode);
		//#endregion

		//#region 2. Set up body style (UnoCSS utilities).
		document.body.classList.add(
			"dark:bg-darksurface",
			"dark:text-white",
			"light:bg-white",
			"light:text-gray-900"
		);
		//#endregion

		//#region 3. Setup dummy backend for development mode.
		if (dev) {
			console.log("Development mode. Using dummy backend (no service worker).");
			$messageWorker = (message: AppMessage) => dummyWorker.postMessage(message);
			$messageWorker({ msgCode: "initialize" });
			return;
		}
		//#endregion

		//#region 4. Check if the browser supports service workers.
		if (!("serviceWorker" in navigator)) {
			$serviceWorkerSupported = false;
			console.error("Service worker not supported by the browser.");
			return;
		}
		//#endregion

		const workerContainer = navigator.serviceWorker;

		//#region 5. Attach message handler.
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
			// 6. Establish channel to worker for other components to use.
			$messageWorker = (message: AppMessage) => worker.postMessage(message);

			// 7. Send initialization message, as soon as the worker becomes active.
			if (worker.state === "activated") {
				$messageWorker({ msgCode: "initialize" });
			} else {
				worker.addEventListener("statechange", () => {
					if (worker.state === "activated") {
						$messageWorker({ msgCode: "initialize" });
					}
				});
			}
		});
	});

	function closeMenus() {
		$userMenuOpen = false;
		$mobileSidebarOpen = false;
	}
</script>

<!-- Preload Fonts -->
<!-- <svelte:head>
	<link
		rel="preload"
		href="/fonts/roboto-v29-latin-regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/> -->
<!-- <link
		rel="preload"
		href="/fonts/Inter-VariableFont_slnt,wght.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/> -->
<!-- <link
		rel="preload"
		href="/fonts/Jost-VariableFont_wght.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head> -->

{#if !$serviceWorkerSupported}
	Your browser does not support service workers.
{:else}
	<Navbar />
	<UserMenu />
	<Sidebar />
	<!-- Content -->
	<div
		on:click={closeMenus}
		class="flex min-h-screen mt-16 ml-0 w-full pt-8 pl-4 transition-margin-left duration-300 overflow-x-hidden {marginLeft}"
	>
		<!-- <div class="bg-black h-screen w-screen opacity-30  -top-8 absolute" /> -->
		<slot />
	</div>
{/if}
