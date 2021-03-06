import type { AppMessage } from "$types/messages";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export const serviceWorkerSupported = writable(true);
export const offline = writable(false);

// Dark mode/Light mode.
export const darkMode = writable(false);

// Navbar is shown/hidden.
export const showNavbar = writable(true);

// Mobile menu open/closed.
export const menuOpen = writable(false);

/**
 * ## User menu is open
 *
 * Determines if the user menu is accessible to the user.
 *
 * * Initial: `false` (closed)
 */
export const userMenuOpen = writable(false);

/**
 * ## Desktop sidebar is collapsed
 *
 * Determines if the desktop sidebar is collapsed or expanded.
 *
 * * Initial: `false` (expanded)
 */
export const desktopSidebarCollapsed = writable(false);

/**
 * ## Mobile sidebar is open
 *
 * Determines if the mobile sidebar is open or closed.
 *
 * * Initial: `false` (closed)
 */
export const mobileSidebarOpen = writable(false);

/**
 * ## Message worker
 *
 * Send a message to the active web worker.
 *
 * @param message Application message.
 */
export const messageWorker: Writable<(message: AppMessage) => void> = writable(() => {
	return;
});
