<script>
	import { onMount } from 'svelte';
	import { buildSrcDoc } from '#lib/playground/buildSrcDoc.js';
	import { parseIframeMessage } from '#lib/playground/iframeProtocol.js';

	/**
	 * @type {{
	 *   code: { html: string, css: string, javascript: string },
	 *   onmessage: (msg: { type: string, args: string[] }) => void,
	 *   fit?: boolean
	 * }}
	 */
	let { code, onmessage, fit = true } = $props();

	let iframeEl;
	let srcdoc = $state('');
	let buildCounter = 0;

	// Debounced rebuild of srcdoc
	let debounceTimer;
	// The first effect run happens right after mount, where onMount already
	// built the initial document; skipping it avoids running the lesson twice.
	let firstRun = true;

	// The iframe is sandboxed without same-origin, so its size comes from the
	// bridge running inside it (see buildSrcDoc.js).
	let contentSize = $state({ width: 0, height: 0 });
	let frameWidth = $state(0);
	let frameHeight = $state(0);

	/**
	 * "Fit" scales the whole document down when it is bigger than the panel, so
	 * the learner sees the finished drawing instead of a scrollbar. Content that
	 * already fits stays at 1:1.
	 */
	const scale = $derived.by(() => {
		if (!fit) return 1;
		if (!contentSize.width || !contentSize.height || !frameWidth || !frameHeight) return 1;
		return Math.min(1, frameWidth / contentSize.width, frameHeight / contentSize.height);
	});

	const scaled = $derived(fit && scale < 1);

	const frameStyle = $derived(
		scaled
			? `width: ${contentSize.width}px; height: ${contentSize.height}px; transform: scale(${scale}); transform-origin: top left;`
			: 'width: 100%; height: 100%;'
	);

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
		if (iframeEl && event.source !== iframeEl.contentWindow) return;

		if (event.data?.__playgroundSize) {
			contentSize = {
				width: Number(event.data.width) || 0,
				height: Number(event.data.height) || 0
			};
			return;
		}

		const parsed = parseIframeMessage(event);
		if (!parsed) return;
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

<div
	class="relative h-full w-full overflow-hidden bg-black"
	bind:clientWidth={frameWidth}
	bind:clientHeight={frameHeight}
>
	<iframe
		bind:this={iframeEl}
		{srcdoc}
		sandbox="allow-scripts"
		title="Preview"
		class="h-full w-full border-none bg-black"
		style={frameStyle}
	></iframe>
</div>
