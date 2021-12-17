<!-- 
  @component
  # Navbar

  Main navigation bar at the top of the page.

  * Is shown/hidden depending on user scroll.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { showNavbar, userMenuOpen, mobileSidebarOpen } from "$stores/general";
	import Hamburger from "$components/Hamburger.svelte";
	import UserMenuButton from "$components/UserMenuButton.svelte";
	import LogoFull from "$components/LogoFull.svelte";

	// Items in the main navigation bar.
	let navBarItems = [{ href: "/", title: "Home" }];

	$: navBarTop = $showNavbar ? "top-0" : "-top-16";
	$: if (!$showNavbar) $userMenuOpen = false;

	onMount(() => {
		let previousScrollPosition = window.pageYOffset;
		window.addEventListener("scroll", () => {
			const currentScrollPosition = window.pageYOffset;
			// Scroll down with tampering.
			if (previousScrollPosition < currentScrollPosition - 2) $showNavbar = false;
			// Scroll up with tampering or at the top of the page.
			if (previousScrollPosition > currentScrollPosition + 3 || currentScrollPosition < 30)
				$showNavbar = true;
			// Update scroll position.
			previousScrollPosition = currentScrollPosition;
		});
	});
</script>

<header
	class="h-16 w-full fixed {navBarTop} shadow-uniform-md font-menu flex z-10"
	u-transition="top duration-300"
	u-light="bg-white"
	u-dark="bg-darksurface-4 shadow-sky-400"
>
	<!-- Left group -->
	<div class="flex mx-2 gap-x-4 items-center sm:mx-4">
		<div class="flex border-gray-500 border-0 border-r-1 py-2 pr-2 items-center sm:hidden">
			<Hamburger class="hover:cursor-pointer" />
		</div>
		<LogoFull />
	</div>

	<!-- Right group -->
	<div class="flex ml-auto mr-2 gap-x-2 items-center" u-sm="mr-4 gap-x-4">
		<UserMenuButton />
	</div>
</header>
