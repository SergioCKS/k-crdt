import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";

export default defineConfig({
	darkMode: "class",
	extract: {
		include: ["./src/routes/**/*.{js,ts,svelte}", "./src/routes/*.{js,ts,svelte}"]
	},
	theme: {
		colors: {
			tree: "#64748b",
			blue: colors.blue,
			green: colors.green
		}
	}
});
