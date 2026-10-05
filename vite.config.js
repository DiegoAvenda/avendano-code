import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// `#lib` / `#lib/*` subpath imports are declared in package.json `imports`.
	// (SvelteKit 3 deprecated the `alias` config option — do not re-add it.)
	plugins: [
		tailwindcss(),
		sveltekit({
			// SvelteKit 3: all Kit config (adapter, …) lives here —
			// svelte.config.js is no longer supported.
			adapter: adapter(),
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]
});
