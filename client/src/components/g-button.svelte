<!-- 
  Glow Button

  Button styled with a glowing neon theme.
  @component

	TODO: Simplify utility usage based on variants (check out `safelist` in Windi config).
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { darkMode } from "$stores/general";

	/**
	 * ## Text
	 *
	 * Text contained within the button.
	 *
	 * * Will be transformed to uppercase.
	 */
	export let text: string = "";

	/**
	 * ## Color
	 *
	 * Color of the button.
	 *
	 * * Used for the border and background of the button.
	 */
	export let color: AllowedColor = "cyan";
	type AllowedColor = "cyan" | "red" | "white";

	let bgColor: string;
	let borderColor: string;
	let shadowColor: string;
	let textColor: string;

	$: textColor = $darkMode ? "text-white" : "text-gray-700";
	$: if (color === "white") borderColor = $darkMode ? "border-white" : "border-gray-700";

	onMount(() => {
		switch (color) {
			case "cyan": {
				bgColor = "bg-cyan-500";
				borderColor = "border-cyan-500";
				shadowColor = "shadow-cyan-500";
				break;
			}
			case "red": {
				bgColor = "bg-red-500";
				borderColor = "border-red-500";
				shadowColor = "shadow-red-500";
				break;
			}
			case "white": {
				if ($darkMode) {
					bgColor = "bg-white";
					borderColor = "border-white";
					shadowColor = "shadow-white";
					textColor = "text-white hover:text-gray-700";
				} else {
					bgColor = "bg-gray-700";
					borderColor = "border-gray-700";
					shadowColor = "shadow-gray-700";
					textColor = "text-gray-700 hover:text-white";
				}
				break;
			}
		}
	});
</script>

<button
	class="{bgColor} border-1 {borderColor} shadow-neon {shadowColor} {textColor} uppercase"
	w-p="y-1 x-6"
	w-bg="opacity-5 hover:opacity-50"
	w-font="roboto tracking-3px"
	w-text="sm opacity-80 hover:opacity-100"
	w-transition="colors duration-400"
>
	{text}
</button>
