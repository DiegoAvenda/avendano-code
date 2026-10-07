<script>
	import { onMount } from 'svelte';
	import { buildSrcDoc } from '#lib/playground/buildSrcDoc.js';
	import { parseIframeMessage } from '#lib/playground/iframeProtocol.js';

	/**
	 * @type {{
	 *   code: { html: string, css: string, javascript: string },
	 *   onmessage: (msg: { type: string, args: string[] }) => void
	 * }}
	 */
	let { code, onmessage } = $props();

	let iframeEl;
	let srcdoc = $state('');
	let buildCounter = 0;

	// Debounced rebuild of srcdoc
	let debounceTimer;
	// The first effect run happens right after mount, where onMount already
	// built the initial document; skipping it avoids running the lesson twice.
	let firstRun = true;

	/**
	 * Every build gets a unique comment so the iframe reloads even when the
	 * source is identical. Without it, pressing Run would clear the console and
	 * then reuse the previous document, so the code would never re-execute.
	 */
	function buildDocument() {
		buildCounter += 1;
		return `${buildSrcDoc(code)}\n<!-- playground build ${buildCounter} -->`;
	}

	$effect(() => {
		// Track individual fields so the effect re-runs when any tab changes.
		const snapshot = [code.html, code.css, code.javascript].join('\0');
		void snapshot;

		if (firstRun) {
			firstRun = false;
			return;
		}

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			srcdoc = buildDocument();
		}, 300);

		return () => clearTimeout(debounceTimer);
	});

	/**
	 * Force-run (no debounce)
	 */
	export function run() {
		clearTimeout(debounceTimer);
		srcdoc = buildDocument();
	}

	// Listen for postMessage from iframe — only accept messages
	// coming from our own preview iframe.
	function handleMessage(event) {
		const parsed = parseIframeMessage(event);
		if (!parsed) return;
		if (iframeEl && event.source !== iframeEl.contentWindow) return;
		onmessage?.(parsed);
	}

	onMount(() => {
		window.addEventListener('message', handleMessage);
		// Initial render
		srcdoc = buildDocument();

		// NOTE: teardown must live here, not in `onDestroy` — in Svelte 5
		// `onDestroy` runs during SSR too, where `window` is undefined.
		return () => {
			window.removeEventListener('message', handleMessage);
			clearTimeout(debounceTimer);
		};
	});
</script>

<div class="h-full overflow-hidden bg-black">
	<iframe
		bind:this={iframeEl}
		{srcdoc}
		sandbox="allow-scripts"
		title="Preview"
		class="h-full w-full border-none bg-black"
	></iframe>
</div>
