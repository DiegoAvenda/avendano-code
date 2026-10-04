<script>
	import { onMount, onDestroy } from 'svelte';

	/**
	 * @type {{
	 *   code: string,
	 *   language: string,
	 *   onchange: (value: string) => void
	 * }}
	 */
	let { code, language = 'javascript', onchange } = $props();

	let editorContainer;
	let editorView;

	/** Keep track of external code updates vs internal edits */
	let externalUpdate = false;

	onMount(async () => {
		const { EditorState } = await import('@codemirror/state');
		const { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection } = await import('@codemirror/view');
		const { defaultKeymap, history, historyKeymap, indentWithTab } = await import('@codemirror/commands');
		const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } = await import('@codemirror/language');
		const { oneDark } = await import('@codemirror/theme-one-dark');
		const { closeBrackets, closeBracketsKeymap } = await import('@codemirror/autocomplete');

		// Pick the right language
		let langExt;
		if (language === 'html') {
			const { html } = await import('@codemirror/lang-html');
			langExt = html();
		} else if (language === 'css') {
			const { css } = await import('@codemirror/lang-css');
			langExt = css();
		} else {
			const { javascript } = await import('@codemirror/lang-javascript');
			langExt = javascript();
		}

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged && !externalUpdate) {
				const value = update.state.doc.toString();
				onchange?.(value);
			}
		});

		const baseTheme = EditorView.theme({
			'&': {
				height: '100%',
				fontSize: '13px',
				fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
			},
			'.cm-scroller': {
				overflow: 'auto'
			},
			'.cm-gutters': {
				backgroundColor: '#1a1a2e',
				borderRight: '1px solid #2a2a44'
			}
		});

		const state = EditorState.create({
			doc: code || '',
			extensions: [
				lineNumbers(),
				highlightActiveLine(),
				highlightSpecialChars(),
				drawSelection(),
				history(),
				bracketMatching(),
				closeBrackets(),
				indentOnInput(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				oneDark,
				baseTheme,
				langExt,
				keymap.of([
					...defaultKeymap,
					...historyKeymap,
					...closeBracketsKeymap,
					indentWithTab
				]),
				updateListener
			]
		});

		editorView = new EditorView({
			state,
			parent: editorContainer
		});
	});

	onDestroy(() => {
		editorView?.destroy();
	});

	// When code prop changes from outside, update the editor content
	$effect(() => {
		if (editorView && code !== undefined) {
			const currentDoc = editorView.state.doc.toString();
			if (currentDoc !== code) {
				externalUpdate = true;
				editorView.dispatch({
					changes: {
						from: 0,
						to: currentDoc.length,
						insert: code
					}
				});
				externalUpdate = false;
			}
		}
	});
</script>

<div class="editor-wrapper" bind:this={editorContainer}></div>

<style>
	.editor-wrapper {
		height: 100%;
		overflow: hidden;
	}
	.editor-wrapper :global(.cm-editor) {
		height: 100%;
	}
</style>
