<script>
	import { onMount } from 'svelte';
	import { buildSrcDoc } from '#lib/playground/buildSrcDoc.js';

	/**
	 * @type {{
	 *   code: { html: string, css: string, javascript: string },
	 *   onmessage: (msg: { type: string, args: string[] }) => void
	 * }}
	 */
	let { code, onmessage } = $props();

	let iframeEl;
	let srcdoc = $state('');

	// Debounced rebuild of srcdoc
	let debounceTimer;

	$effect(() => {
		// Access code to register reactivity
		const _html = code.html;
		const _css = code.css;
		const _js = code.javascript;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			srcdoc = buildSrcDoc(code);
		}, 300);
	});

	/**
	 * Force-run (no debounce)
	 */
	export function run() {
		clearTimeout(debounceTimer);
		srcdoc = buildSrcDoc(code);
	}

	// Listen for postMessage from iframe
	function handleMessage(event) {
		const data = event.data;
		if (!data || !data.__playground) return;
		onmessage?.({
			type: data.type,
			args: data.args || []
		});
	}

	onMount(() => {
		window.addEventListener('message', handleMessage);
		// Initial render
		srcdoc = buildSrcDoc(code);

		// NOTE: teardown must live here, not in `onDestroy` — in Svelte 5
		// `onDestroy` runs during SSR too, where `window` is undefined.
		return () => {
			window.removeEventListener('message', handleMessage);
			clearTimeout(debounceTimer);
		};
	});
</script>

<div class="preview-container">
	<iframe
		bind:this={iframeEl}
		{srcdoc}
		sandbox="allow-scripts"
		title="Preview"
		class="preview-iframe"
	></iframe>
</div>

<style>
	.preview-container {
		height: 100%;
		background: #1a1a2e;
		border-radius: 0 0 8px 8px;
		overflow: hidden;
	}
	.preview-iframe {
		width: 100%;
		height: 100%;
		border: none;
		background: #1a1a2e;
	}
</style>
