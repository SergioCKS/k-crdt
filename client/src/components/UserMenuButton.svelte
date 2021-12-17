<!-- 
  # User menu button

  Button for opening the main user menu.
  
  * Toggles the `userMenuOpen` store. 
  @component 
-->
<script lang="ts">
	import { onMount } from "svelte";
	import Icon from "$components/Icon.svelte";
	import { userMenuOpen } from "$stores/general";
	import Iconify from "@iconify/iconify";

	onMount(() => {
		Iconify.loadIcons(["ph:user-fill", "ph:caret-down-light", "ph:caret-up-light"]);
	});
</script>

<button
	on:click={() => ($userMenuOpen = !$userMenuOpen)}
	class="rounded-full flex border-1 items-center menu-button no-tap-highlight"
	u-p="y-1 x-2"
	u-dark="bg-darksurface-2 border-gray-700 hover:border-form-focus focus:border-form-focus"
	u-light="bg-gray-200 border-gray-400 hover:border-form-focus focus:border-form-focus"
	u-hover="cursor-pointer shadow-form-focus"
	u-focus="shadow-form-focus"
	u-focus-visible="outline-none"
	u-transition="shadow duration-300"
>
	<Icon name="ph:user-fill" class="h-full justify-center" u-flex="~ col" fontSize="24px" />
	<div class="h-[20px] w-[20px] overflow-hidden">
		{#if $userMenuOpen}
			<Icon name="ph:caret-up-light" fontSize="20px" />
		{:else}
			<Icon name="ph:caret-down-light" fontSize="20px" />
		{/if}
	</div>
</button>
