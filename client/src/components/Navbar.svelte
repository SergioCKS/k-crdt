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
	w-p="y-1 l-4 r-2"
	w-transition="top duration-300"
	w-light="bg-white shadow-bottom"
	w-dark="bg-darksurface-3"
>
	<!-- Logo-->
	<LogoFull height="3.5rem" />
	<!-- Navbar -->
	<div class="flex font-menu w-full gap-x-4 items-center">
		<!-- Navbar: Left Side -->
		<nav class="w-full">
			<ul class="w-full px-6 gap-x-4 justify-center sm:(flex justify-start) -sm:hidden ">
				{#each navBarItems as { href, title }}
					<li class="text-center w-16 menu-button">
						<a class="px-2" {href}>{title}</a>
					</li>
				{/each}
			</ul>
		</nav>
		<!-- Navbar: Right Side  -->
		<div class="flex gap-x-2 items-center">
			<Hamburger class="sm:hidden" />
			<!-- Toggle dark/light -->
			<DarkModeSwitch />
			<!-- Login -->
			<Icon name="mdi:login" class="menu-button sm:hidden -sm:block" href="/" fontSize="24px" />
			<!-- Login (larger screens) -->
			<a class="mx-2 px-2 menu-button sm:block -sm:hidden" href="/">Login</a>
		</div>
	</div>
</header>
