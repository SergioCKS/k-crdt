import adapter from "@sveltejs/adapter-static";
import preprocess from 'svelte-preprocess';
import WindiCSS from "vite-plugin-windicss";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		files: {
			serviceWorker: "src/backend/worker/index.ts"
		},
		vite: {
			plugins: [
				WindiCSS()
			],
			resolve: {
				alias: {
					"$types": path.resolve("./src/types"),
					"$utils": path.resolve("./src/utils"),
					"$src": path.resolve("./src"),
					"$components": path.resolve("./src/components"),
					"$stores": path.resolve("./src/stores")
				}
			}
		}
	}
};

export default config;
