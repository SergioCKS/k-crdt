<script lang="ts">
	import { initialized, registers } from "../stores/engine";
	import { offline, messageWorker, darkMode } from "../stores/general";
	import GButton from "$components/g-button.svelte";

	const data = [
		{ a: "Data 1", b: "Data 2", c: "Data 3" },
		{ a: "Data 3", b: "Data 4", c: "Data 5" },
		{ a: "Data 5", b: "Data 6", c: "Data 6" },
		{ a: "Data 5", b: "Data 6" },
		{ a: "Data 5", c: "Data 6" }
	];
</script>

{#if !$initialized}
	Initializing ...
{:else}
	<div class="flex flex-col w-full">
		<!-- Controls -->
		<div class="flex flex-row">
			<button on:click={() => $messageWorker({ msgCode: "test" })}>Test</button>
			<button on:click={() => console.log("TODO: Create new record.")}>New Record</button>
			Offline: {$offline}
			Dark mode: {$darkMode}
			{JSON.stringify($registers)}
		</div>
		<!-- Table -->
		<table class="rounded my-4 text-center overflow-hidden" w-shadow="uniform-md dark:cyan-400">
			<!-- Table header -->
			<thead class="shadow-uniform-sm dark:shadow-cyan-400">
				<tr>
					{#each Object.keys(data[0]) as colName}
						<th>{colName}</th>
					{/each}
				</tr>
			</thead>
			<!-- Table body -->
			<tbody w-divide="gray-200 y-[0.5px]">
				{#each data as row}
					<tr
						w-divide="gray-200 x-[0.5px]"
						w-bg="even:(light:gray-50 dark:darksurface-2) hover:(light:blue-50 dark:darksurface-5)"
					>
						{#each Object.values(row) as col}
							<td>{col}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
			<!-- Table footer -->
			<tfoot w-shadow="uniform-md dark:cyan-400">
				<tr>
					<th colspan={data.length}>Footer</th>
				</tr>
			</tfoot>
		</table>
	</div>
	<div class="flex flex-row space-x-2 w-full p-2 justify-end dark:bg-gray-700 light:bg-white">
		<GButton text="Accept" color="cyan" />
		<GButton text="Refuse" color="red" />
		<GButton text="More Info" color="white" />
	</div>
{/if}
