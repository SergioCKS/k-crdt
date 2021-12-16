import { defineConfig } from "windicss/helpers";
import plugin from "windicss/plugin";

/**
 * Custom Utilities Plugin.
 * Adds custom utilities.
 */
const customUtilities = plugin(({ addUtilities }) => {
	addUtilities({
		// Transition absolute top.
		".transition-top": {
			"transition-property": "top"
		},
		// Menu Font
		".font-menu": {
			"font-family": "Jost, sans-serif",
			"font-variation-settings": "'wght' 400",
			"font-size": "1.125rem",
			"line-height": "1.75rem",
			"letter-spacing": "0.025em"
		},
		// Remove default mobile blue highlight on tap.
		".no-tap-highlight": {
			"-webkit-tap-highlight-color": "transparent"
		}
	});
});

export default defineConfig({
	darkMode: "class",
	extract: {
		include: [
			"./src/routes/**/*.{js,ts,svelte}",
			"./src/routes/*.{js,ts,svelte}",
			"./src/components/**/*.{js,ts,svelte}",
			"./src/components/*.{js,ts,svelte}"
		]
	},
	attributify: {
		prefix: "w-"
	},
	theme: {
		extend: {
			colors: {
				tree: "#64748b",
				sprout: {
					gray: "#394141"
				},
				darksurface: {
					DEFAULT: "#121212",
					"1": "#16141b",
					"2": "#1b1a20",
					"3": "#211f26",
					"4": "#27252c",
					"5": "#2d2b31",
					"6": "#323137",
					"7": "#39373d",
					"8": "#39373d",
					"9": "#3e3d42",
					"10": "#454349"
				},
				form: {
					focus: "rgba(81, 203, 238, 1)"
				}
			},
			animation: {
				ripple: "ripple 0.5s linear infinite"
			},
			keyframes: {
				ripple: {
					"0%": {
						width: "0px",
						height: "0px",
						opacity: "0.5"
					},
					"100%": {
						width: "var(--ripple-size)",
						height: "var(--ripple-size)",
						opacity: "0"
					}
				}
			},
			fontFamily: {
				roboto: "Roboto"
			},
			boxShadow: {
				neon: "0px 0px 4px rgba(0, 0, 0, 0.45), inset 0px 0px 4px rgba(0, 0, 0, 0.45)",
				"uniform-sm": "0px 2px 4px rgba(0, 0, 0, 0.15)",
				"uniform-md": "0px 2px 8px rgba(0, 0, 0, 0.15)",
				"form-focus": "0 0 5px rgba(81, 203, 238, 1)",
				knob: "0 0.15em 0.3em rgb(0 0 0 / 15%), 0 0.2em 0.5em rgb(0 0 0 / 30%)",
				bottom: "0 -0.4rem 0.9rem 0.2rem rgb(0 0 0 / 40%)"
			}
		}
	},
	shortcuts: {
		"menu-button":
			"transition-colors duration-300 light:text-gray-600 dark:text-gray-400 hover:(light:text-gray-900 dark:text-gray-100) font-jost",
		"hamburger-bar":
			"rounded-full h-1 transform transition-all left-1/2 w-6 duration-400 absolute light:group-hover:bg-gray-900 dark:group-hover:bg-gray-100 light:bg-gray-600 dark:bg-gray-400"
	},
	plugins: [customUtilities, require("windicss/plugin/forms")]
});
