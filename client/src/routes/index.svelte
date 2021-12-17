<script lang="ts">
	import { initialized, registers } from "../stores/engine";
	import { offline, messageWorker, darkMode, userMenuOpen } from "../stores/general";

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
			User menu open: {$userMenuOpen}
			{JSON.stringify($registers)}
		</div>
		<!-- Table -->
		<table class="rounded my-4 text-center overflow-hidden" u-shadow="uniform-md dark:cyan-400">
			<!-- Table header -->
			<thead u-shadow="uniform-sm dark:cyan-400">
				<tr>
					{#each Object.keys(data[0]) as colName}
						<th>{colName}</th>
					{/each}
				</tr>
			</thead>
			<!-- Table body -->
			<tbody class="divide-gray-200 divide-y-1">
				{#each data as row}
					<tr class="divide-gray-200 divide-x-1 hover:bg-blue-50  even:bg-gray-100">
						{#each Object.values(row) as col}
							<td>{col}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
			<!-- Table footer -->
			<tfoot u-shadow="uniform-md dark:cyan-400">
				<tr>
					<th colspan={data.length}>Footer</th>
				</tr>
			</tfoot>
		</table>
		<div u-flex="~ row" class="w-full dark:bg-gray-700 light:bg-white">
			<div u-flex="~ row" class="ml-auto space-x-2 mr-4">
				<button class="g-btn-cyan-400">Accept</button>
				<button class="g-btn-red-500">Reject</button>
				<button class="g-btn-white">More Info</button>
			</div>
		</div>
	</div>
{/if}
