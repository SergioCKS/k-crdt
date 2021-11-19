import adapter from "@sveltejs/adapter-static";
import preprocess from 'svelte-preprocess';
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
			resolve: {
				alias: {
					"$types": path.resolve("./src/types")
				}
			}
		}
	}
};

export default config;
