<script lang="ts">
	import { initialized, registers } from "../stores/engine";
	import { offline, messageWorker } from "../stores/general";
</script>

{#if !$initialized}
	Initializing ...
{:else}
	<button on:click={() => $messageWorker({ msgCode: "test" })}>Test</button>
	<button on:click={() => console.log("TODO: Create new record.")}>New Record</button>
	Offline: {$offline}
	{JSON.stringify($registers)}
{/if}
