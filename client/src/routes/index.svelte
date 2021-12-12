<script lang="ts">
	import { initialized, registers } from "../stores/engine";
	import { offline, messageWorker } from "../stores/general";
</script>

{#if !$initialized}
	Initializing ...
{:else}
	<div class="bg-tree h-20 w-20" />
	<div class=" bg-blue-400 h-20 w-20" />
	<div class=" bg-green-400 h-20 w-20" />
	<button on:click={() => $messageWorker({ msgCode: "test" })}>Test</button>
	<button on:click={() => console.log("TODO: Create new record.")}>New Record</button>
	Offline: {$offline}
	{JSON.stringify($registers)}
{/if}
