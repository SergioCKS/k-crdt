<!-- 
  # Hamburger

  Animated hamburger menu icon.
  Clicking on the icon toggles the `menuOpen` store.
  
  **Props:**
  * **`class`** Appends classes to outmost button element.
	
	@component
-->
<script lang="ts">
	import { menuOpen } from "$stores/general";

	$: transformTop = $menuOpen
		? "transform: translateY(0.31rem) translateX(-50%) rotate(45deg);"
		: "transform: translateX(-50%);";

	$: transformBottom = $menuOpen
		? "transform: translateY(-0.31rem) translateX(-50%) rotate(-45deg);"
		: "transform: translateX(-50%);";
</script>

<button
	on:click={() => ($menuOpen = !$menuOpen)}
	class={"h-8 w-8 relative children:light:bg-gray-500 hover:children:light:bg-gray-700 children:dark:bg-gray-400 hover:children:dark:bg-gray-200 " +
		$$props.class}
	u-focus-visible="outline-none ring-1 ring-form-focus"
>
	<!-- Upper bar -->
	<div class="top-2.25 hamburger-bar" style={transformTop} />
	<!-- Lower bar -->
	<div class="bottom-2.25 hamburger-bar" style={transformBottom} />
</button>
