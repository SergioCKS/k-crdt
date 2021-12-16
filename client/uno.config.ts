import { defineConfig } from "unocss";
import { extractorSvelte } from "@unocss/core";
import { presetAttributify, presetUno } from "unocss";

export default defineConfig({
	extractors: [extractorSvelte],
	presets: [
		presetAttributify({
			prefix: "u-"
		}),
		presetUno()
	],
	rules: [["no-tap-highlight", { "-webkit-tap-highlight-color": "transparent" }]],
	shortcuts: [
		{
			btn: "bg-black border-black font-roboto bg-opacity-5 shadow-neon text-sm py-1 px-6 transition-colors text-opacity-80 tracking-3px duration-400 inline-block uppercase hover:bg-opacity-50 hover:text-opacity-100",
			"hamburger-bar":
				"rounded-full h-1 transform transition-all left-1/2 w-6 duration-400 absolute light:group-hover:bg-gray-900 dark:group-hover:bg-gray-100 light:bg-gray-600 dark:bg-gray-400",
			"menu-button":
				"transition-colors duration-300 light:text-gray-600 dark:text-gray-400 hover:(light:text-gray-900 dark:text-gray-100) font-jost"
		},
		[
			/^g-btn-(.*)$/,
			([, c]) => {
				let lightColor = c;
				let hoverSwitchTextColor = "";
				if (c === "white") {
					lightColor = "gray-700";
					hoverSwitchTextColor = "light:hover:text-white dark:hover:text-gray-700";
				}
				const lightUtils = `border-${lightColor} shadow-${lightColor} bg-${lightColor} bg-opacity-5 focus:bg-opacity-50 hover:bg-opacity-50 active:bg-opacity-50 text-gray-700 text-opacity-80 hover:text-opacity-100`;
				const darkUtils = `border-${c} shadow-${c} bg-${c} bg-opacity-5 focus:bg-opacity-50 hover:bg-opacity-50  text-white text-opacity-80 hover:text-opacity-100`;

				return `border-1 light:(${lightUtils}) dark:(${darkUtils}) ${hoverSwitchTextColor} font-roboto shadow-neon text-sm py-1 px-6 transition-colors tracking-3px duration-400 uppercase hover:cursor-pointer m-auto focus-visible:outline-none`;
			}
		]
	],
	theme: {
		colors: {
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
		fontFamily: {
			roboto: "Roboto",
			inter: "Inter"
		},
		boxShadow: {
			neon: "0px 0px 4px rgba(var(--un-shadow-color), 0.45), inset 0px 0px 4px rgba(var(--un-shadow-color), 0.45)",
			"uniform-md": "0px 2px 8px rgba(var(--un-shadow-color), 0.15)",
			"uniform-sm": "0px 2px 4px rgba(var(--un-shadow-color), 0.15)",
			bottom: "0 -0.4rem 0.9rem 0.2rem rgb(var(--un-shadow-color))",
			"form-focus": "0 0 5px rgba(81, 203, 238, 1)"
		}
	}
});
