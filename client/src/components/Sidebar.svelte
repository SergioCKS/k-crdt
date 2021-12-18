<!-- 
	# Desktop sidebar

	Sidebar designed for landscape viewports.
	
	* It can be in a collapsed or expanded state.
	* It adapts to the navbar visibility.
	* It closes the the user menu on click.
	@component
-->
<script lang="ts">
	import { fly } from "svelte/transition";
	import {
		desktopSidebarCollapsed,
		showNavbar,
		userMenuOpen,
		mobileSidebarOpen
	} from "$stores/general";
	import Icon from "./Icon.svelte";
	import SidebarContent from "$components/SidebarContent.svelte";

	$: width = $desktopSidebarCollapsed ? "w-14" : "w-60";
	$: paddingTop = $showNavbar ? "pt-16" : "pt-0";
</script>

<!-- Mobile sidebar -->
{#if $mobileSidebarOpen}
	<div
		in:fly={{ x: -240, opacity: 1 }}
		out:fly={{ x: -240, opacity: 1 }}
		on:click={() => ($userMenuOpen = false)}
		class="flex w-60 sidebar sm:hidden"
	>
		<div class={paddingTop} u-transition="padding duration-300">
			<SidebarContent />
		</div>
	</div>
{/if}

<!-- Desktop sidebar -->
<div
	on:click={() => ($userMenuOpen = false)}
	class="{width} sidebar hidden sm:flex"
	u-transition="width duration-300"
>
	<div class={paddingTop} u-transition="padding duration-300">
		<SidebarContent />
	</div>
	<!-- Expand/collapse button -->
	<button
		on:click={() => ($desktopSidebarCollapsed = !$desktopSidebarCollapsed)}
		class="flex mt-auto h-16 w-full items-center justify-around menu-button"
	>
		{#if !$desktopSidebarCollapsed}
			<p class="whitespace-nowrap">Collapse sidebar:</p>
		{/if}
		{#if $desktopSidebarCollapsed}
			<!-- <Icon name="mdi:chevron-double-right" fontSize="24px" /> -->
			<Icon name="ph:caret-double-right-light" fontSize="24px" />
		{:else}
			<!-- <Icon name="mdi:chevron-double-left" fontSize="24px" /> -->
			<Icon name="ph:caret-double-left-light" fontSize="24px" />
		{/if}
	</button>
</div>
