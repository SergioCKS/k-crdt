<!-- 
  @component
  # Dark Mode Switch

  Custom switch that toggles dark/light mode.

  * Updates the `darkMode` store.
  * Works both with click events, as well as keyboard events.
  * Implemented as an HTML checkbox.
-->
<script lang="ts">
	import { browser } from "$app/env";
	import { darkMode } from "$stores/general";
	import Icon from "$components/Icon.svelte";

	/**
	 * Toggle dark/light mode.
	 *
	 * * Overrides browser default.
	 * * Is only run client-side.
	 * * It is called reactively on dark/light mode change.
	 *
	 * @param darkMode Value to apply.
	 */
	function toggleDarkLight(darkMode: boolean) {
		if (!browser) return;
		const rootElement = document.documentElement;
		if (darkMode) {
			// Toggle from light to dark.
			rootElement.classList.remove("light");
			rootElement.classList.add("dark");
		} else {
			// Toggle from dark to light.
			rootElement.classList.remove("dark");
			rootElement.classList.add("light");
		}
	}
	$: toggleDarkLight($darkMode);

	//#region Switch events.
	/**
	 * Signals that the dark/light mode toggle was already handled.
	 * Used to prevent switch default to trigger a second toggle.
	 */
	let toggleAlreadyHandled: boolean = false;

	/**
	 * Handles switch `mousedown` event.
	 *
	 * * Updates the checkbox `checked` property.
	 * * Updated the `darkMode` store.
	 * * Triggers the ping animation of the inner circle.
	 * @param event Mouse event.
	 */
	function handleSwitchMouseDown(event: MouseEvent) {
		toggleAlreadyHandled = true;
		// Get target input element.
		let checkbox = event.target as HTMLInputElement;
		// Update value.
		checkbox.checked = !checkbox.checked;
		$darkMode = !$darkMode;
		// Trigger timed animation.
		animateCircle = true;
		setTimeout(() => (animateCircle = false), 400);
	}

	/**
	 * Handle switch `click` event.
	 *
	 * Aborts default if the toggle was previously handled by the `mousedown` event.
	 * @param event Mouse event.
	 */
	function handleSwitchClick(event: MouseEvent) {
		if (toggleAlreadyHandled) {
			event.preventDefault();
			toggleAlreadyHandled = false;
		}
	}
	//#endregion

	//#region Dinamic CSS properties.
	/**
	 * Switch inner circle position (left or right).
	 */
	$: switchLeft = $darkMode ? "left-6" : "left-1";

	/**
	 * Triggers the inner circle ping animation.
	 */
	let animateCircle: boolean = false;
	$: innerCircleAnimate = animateCircle ? "animate-ping" : "";
	//#endregion
</script>

<label
	for="dark-mode-switch"
	class="rounded-full h-7 w-12 relative no-tap-highlight"
	u-dark="bg-darksurface-1 text-gray-400 hover:text-gray-200"
	u-light="bg-gray-200 text-gray-700 hover:text-gray-900"
	u-hover="shadow-form-focus ring-0.5 ring-form-focus cursor-pointer"
	u-transition="all duration-300"
	u-focus-visible="outline-none"
>
	<input
		id="dark-mode-switch"
		type="checkbox"
		bind:checked={$darkMode}
		on:mousedown={handleSwitchMouseDown}
		on:click={handleSwitchClick}
		class="rounded-full h-full m-0 w-full top-0 left-0 z-10 absolute hover:cursor-pointer"
		u-focus-visible="outline-none ring-0.5 ring-form-focus shadow-form-focus"
	/>
	<!-- Switch knob -->
	<div
		class="{switchLeft} rounded-full shadow-knob h-5 w-5 z-5 absolute top-1"
		u-transition="all duration-300"
	>
		<div class="rounded-full h-full w-full relative">
			<!-- Circle for ping effect -->
			<div class="{innerCircleAnimate} bg-white rounded-full h-full w-full absolute" />
			<!-- Knob icon -->
			<div class="bg-white rounded-full flex h-full w-full absolute items-center justify-center">
				{#if $darkMode}
					<Icon
						name="bi:moon-fill"
						width="0.75rem"
						height="0.75rem"
						class="flex text-sky-500 items-center justify-center"
					/>
				{:else}
					<Icon
						name="bi:sun-fill"
						width="0.75rem"
						height="0.75rem"
						class="flex text-yellow-500 items-center justify-center"
					/>
				{/if}
			</div>
		</div>
	</div>
	<!-- Icons -->
	<Icon
		name="bi:sun-fill"
		width="0.75rem"
		height="0.75rem"
		class="flex flex-col h-full top-0 left-1.75 justify-center absolute"
	/>
	<Icon
		name="bi:moon-fill"
		width="0.625rem"
		height="0.625rem"
		class="flex flex-col h-full top-0 right-1.75 justify-center absolute"
	/>
</label>
