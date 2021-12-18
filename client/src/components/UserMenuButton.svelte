<!-- 
  # User menu button

  Button for opening the main user menu.
  
  * Toggles the `userMenuOpen` store. 
  @component 
-->
<script lang="ts">
	import Icon from "$components/Icon.svelte";
	import { userMenuOpen } from "$stores/general";
</script>

<button
	on:click={() => ($userMenuOpen = !$userMenuOpen)}
	class="rounded-full flex items-center menu-button"
	u-p="y-1 x-4"
>
	<Icon name="ph:user-fill" u-flex="~ col" fontSize="20px" />
	<div class="h-[20px] w-[20px]">
		{#if $userMenuOpen}
			<Icon name="ph:caret-up-light" fontSize="20px" />
		{:else}
			<Icon name="ph:caret-down-light" fontSize="20px" />
		{/if}
	</div>
</button>
