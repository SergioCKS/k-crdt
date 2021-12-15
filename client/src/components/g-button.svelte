<!-- 
  Glow Button

  Button styled with a glowing neon theme.
  @component
-->
<script lang="ts">
	import { colorUtils, AllowedColor } from "$types/colors";

	/**
	 * ## Text
	 *
	 * Text contained within the button. Default: `""`.
	 *
	 * * Will be transformed to uppercase.
	 */
	export let text: string = "";

	/**
	 * ## Color
	 *
	 * Color of the button. Default: `cyan`.
	 *
	 * * Used for the border and background of the button.
	 */
	export let color: AllowedColor = "cyan";
</script>

<button
	class="border-1 shadow-neon {colorUtils[color]}"
	w-p="y-1 x-6"
	w-text="uppercase opacity-80 sm hover:opacity-100"
	w-font="roboto tracking-3px"
	w-bg="light:opacity-5 dark:opacity-5 hover:opacity-50"
	w-transition="colors duration-400"
>
	{text}
</button>
