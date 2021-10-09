<script lang="ts">
	async function printWasm() {
		const registration = await navigator.serviceWorker.ready;

		registration.active.postMessage({
			msgCode: "print-gcounter",
			payload: ""
		});
	}
</script>

<button on:click={printWasm}>Print WASM</button>
