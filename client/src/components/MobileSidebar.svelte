<script lang="ts">
	import { fly } from "svelte/transition";
	import { userMenuOpen, mobileSidebarOpen, showNavbar } from "$stores/general";
	import SidebarContent from "$components/SidebarContent.svelte";

	$: paddingTop = $showNavbar ? "pt-16" : "pt-0";
</script>

{#if $mobileSidebarOpen}
	<div
		in:fly={{ x: -240, opacity: 1 }}
		out:fly={{ x: -240, opacity: 1 }}
		on:click={() => ($userMenuOpen = false)}
		class="flex-col flex font-jost h-screen shadow-uniform-md {paddingTop} top-0 left-0 w-60 fixed sm:hidden"
		u-light="bg-white"
		u-transition="padding duration-300"
		u-dark="bg-darksurface-7 shadow-sky-300"
	>
		<SidebarContent />
	</div>
{/if}
