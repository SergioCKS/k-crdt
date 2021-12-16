<!-- 
  @component
  # Hamburger

  Animated hamburger menu icon.
  Clicking on the icon toggles the `menuOpen` store.
  
  **Props:**
  * **`class`** Appends classes to outmost button element.
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

<button on:click={() => ($menuOpen = !$menuOpen)} class={"h-8 w-8 relative " + $$props.class}>
	<!-- Upper bar -->
	<div class="top-2.25 hamburger-bar" style={transformTop} />
	<!-- Lower bar -->
	<div class="bottom-2.25 hamburger-bar" style={transformBottom} />
</button>
