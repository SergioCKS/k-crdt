<script lang="ts">
	import { fly } from "svelte/transition";
	import { userMenuOpen } from "$stores/general";
	import DarkModeSwitch from "$components/DarkModeSwitch.svelte";
</script>

{#if $userMenuOpen}
	<div
		in:fly={{ y: -200, duration: 300, opacity: 1 }}
		out:fly={{ y: -200, duration: 300, opacity: 1 }}
		class="font-jost h-[200px] shadow-uniform-md top-16 right-0 w-40 absolute justify-end"
		u-p="x-2 y-4"
		u-flex="~ col"
		u-light="bg-white"
		u-dark="bg-darksurface-4 shadow-sky-300"
	>
		<div class="flex w-full pt-2 items-center justify-around" u-border="0 t-1 gray-500">
			Dark mode:
			<DarkModeSwitch />
		</div>
	</div>
{/if}
