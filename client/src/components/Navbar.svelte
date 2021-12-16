<!-- 
  @component
  # Navbar

  Main navigation bar at the top of the page.

  * Is shown/hidden depending on user scroll.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { showNavbar } from "$stores/general";
	import Icon from "$components/Icon.svelte";
	import Hamburger from "$components/Hamburger.svelte";
	import DarkModeSwitch from "$components/DarkModeSwitch.svelte";
	import LogoFull from "$components/LogoFull.svelte";

	// Items in the main navigation bar.
	let navBarItems = [{ href: "/", title: "Home" }];

	$: navBarTop = $showNavbar ? "top-0" : "-top-16";

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
	class="flex h-16 w-full overflow-hidden fixed items-center {navBarTop}"
	u-p="y-1 l-4 r-2"
	u-transition="top duration-300"
	u-light="bg-white shadow-bottom"
	u-dark="bg-darksurface-3"
>
	<!-- Logo-->
	<LogoFull />
	<!-- Navbar -->
	<div class="flex font-menu w-full pr-6 gap-x-4 items-center">
		<!-- Navbar: Left Side -->
		<nav>
			<ul class="w-full px-6 gap-x-4 justify-center hidden sm:flex ">
				{#each navBarItems as { href, title }}
					<li class="text-center w-16 menu-button">
						<a class="px-2" {href}>{title}</a>
					</li>
				{/each}
			</ul>
		</nav>
		<!-- Navbar: Right Side  -->
		<div class="flex ml-auto gap-x-2 items-center">
			<Hamburger class="sm:hidden hover:cursor-pointer" />
			<!-- Toggle dark/light -->
			<DarkModeSwitch />
			<!-- Login -->
			<Icon
				name="mdi:login"
				class="flex flex-col h-full menu-button justify-center sm:hidden -sm:block hover:cursor-pointer"
				fontSize="24px"
			/>
			<!-- Login (larger screens) -->
			<a class="mx-2 px-2 menu-button hidden sm:block" href="/">Login</a>
		</div>
	</div>
</header>
