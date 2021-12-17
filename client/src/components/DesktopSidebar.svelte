<script lang="ts">
	import { onMount } from "svelte";
	import { desktopSidebarCollapsed, showNavbar, userMenuOpen } from "$stores/general";
	import Icon from "./Icon.svelte";
	import Iconify from "@iconify/iconify";
	import SidebarContent from "$components/SidebarContent.svelte";

	$: width = $desktopSidebarCollapsed ? "w-14" : "w-60";
	$: height = $showNavbar ? "calc(100vh - 4rem)" : "100vh";
	$: top = $showNavbar ? "top-16" : "top-0";

	onMount(() => {
		Iconify.loadIcons(["mdi:chevron-double-left", "mdi:chevron-double-right"]);
	});
</script>

<div
	on:click={() => ($userMenuOpen = false)}
	class="font-jost shadow-uniform-md {width} fixed {top} left-0 flex-col hidden sm:flex"
	style="height: {height};"
	u-transition="all duration-300"
	u-light="bg-white"
	u-dark="bg-darksurface-7 shadow-sky-300"
>
	<SidebarContent />
	<button
		on:click={() => ($desktopSidebarCollapsed = !$desktopSidebarCollapsed)}
		class="flex mt-auto h-16 text-base mb-4 w-full pt-2 items-center justify-around menu-button hover:cursor-pointer"
		u-dark="bg-darksurface-2 border-gray-700 hover:border-form-focus focus:border-form-focus"
		u-light="bg-gray-200 border-gray-400 hover:border-form-focus focus:border-form-focus"
		u-focus="shadow-form-focus"
		u-focus-visible="outline-none"
		u-border="0 t-1 gray-500"
	>
		{#if !$desktopSidebarCollapsed}
			<p class="whitespace-nowrap">Collapse sidebar:</p>
		{/if}
		{#if $desktopSidebarCollapsed}
			<Icon name="mdi:chevron-double-right" fontSize="24px" />
		{:else}
			<Icon name="mdi:chevron-double-left" fontSize="24px" />
		{/if}
	</button>
</div>
