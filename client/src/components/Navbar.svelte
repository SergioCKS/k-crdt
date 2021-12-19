<!-- 
  @component
  # Navbar

  Main navigation bar at the top of the page.

  * Is shown/hidden depending on user scroll.
-->
<script lang="ts">
	import { showNavbar, userMenuOpen, mobileSidebarOpen } from "$stores/general";
	import Icon from "./Icon.svelte";
	import LogoFull from "$components/LogoFull.svelte";

	// Items in the main navigation bar.
	let navBarItems = [{ href: "/", title: "Home" }];

	$: navBarTop = $showNavbar ? "top-0" : "-top-16";
	$: if (!$showNavbar) $userMenuOpen = false;

	//#region Hamburger bar transforms
	$: transformTop = $mobileSidebarOpen
		? "transform: translateY(0.31rem) translateX(-50%) rotate(45deg);"
		: "transform: translateX(-50%);";

	$: transformBottom = $mobileSidebarOpen
		? "transform: translateY(-0.31rem) translateX(-50%) rotate(-45deg);"
		: "transform: translateX(-50%);";
	//#endregion
</script>

<header
	class="h-16 w-full fixed {navBarTop} shadow-uniform-md font-menu flex z-10"
	u-transition="top duration-300"
	u-light="bg-white"
	u-dark="bg-darksurface-4 shadow-sky-400"
>
	<!-- Left group -->
	<div class="flex mx-2 gap-x-4 items-center sm:mx-4">
		<!-- Menu hamburger -->
		<div class="flex items-center sm:hidden" u-p="y-2 r-2" u-border="gray-500 0 r-1">
			<button
				on:click={() => ($mobileSidebarOpen = !$mobileSidebarOpen)}
				class="h-8 w-8 relative no-tap-highlight children:dark:bg-gray-400 children:light:bg-gray-500"
				u-hover="cursor-pointer children:dark:bg-gray-200 children:light:bg-gray-700"
				u-focus-visible="outline-none ring-1 ring-form-focus"
			>
				<!-- Upper bar -->
				<div class="top-2.25 hamburger-bar" style={transformTop} />
				<!-- Lower bar -->
				<div class="bottom-2.25 hamburger-bar" style={transformBottom} />
			</button>
		</div>
		<LogoFull />
	</div>

	<!-- Right group -->
	<div class="flex ml-auto mr-2 gap-x-2 items-center" u-sm="mr-4 gap-x-4">
		<!-- User menu button -->
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
	</div>
</header>
