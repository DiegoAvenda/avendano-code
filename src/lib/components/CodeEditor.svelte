<script>
	import { onDestroy, onMount, untrack } from 'svelte';

	/**
	 * @type {{
	 *   code: string,
	 *   language: string,
	 *   onchange: (value: string) => void
	 * }}
	 */
	let { code, language = 'javascript', onchange } = $props();

	let editorContainer;
	/** @type {any} */
	let editorView;

	/**
	 * One CodeMirror state per tab. Keeping them alive means switching tabs
	 * preserves undo history, cursor position and scroll for each language
	 * instead of recreating the editor (which used to reset all three).
	 * `SvelteMap` would make these reads reactive, which would re-trigger the
	 * sync effect below, so this stays a plain (non-reactive) cache.
	 * @type {Map<string, any>}
	 */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- non-reactive implementation cache
	const editorStates = new Map();

	let ready = $state(false);
	let currentLanguage = untrack(() => language);
	let destroyed = false;
	let externalUpdate = false;

	/** @type {(lang: string, doc: string) => any} */
	let createState = () => {
		throw new Error('editor state factory used before CodeMirror finished loading');
	};

	onMount(async () => {
		const { EditorState } = await import('@codemirror/state');
		const {
			EditorView,
			keymap,
			lineNumbers,
			highlightActiveLine,
			highlightSpecialChars,
			drawSelection
		} = await import('@codemirror/view');
		const { defaultKeymap, history, historyKeymap, indentWithTab } =
			await import('@codemirror/commands');
		const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } =
			await import('@codemirror/language');
		const { oneDark } = await import('@codemirror/theme-one-dark');
		const { closeBrackets, closeBracketsKeymap } = await import('@codemirror/autocomplete');

		const [htmlSupport, cssSupport, javascriptSupport] = await Promise.all([
			import('@codemirror/lang-html').then((mod) => mod.html()),
			import('@codemirror/lang-css').then((mod) => mod.css()),
			import('@codemirror/lang-javascript').then((mod) => mod.javascript())
		]);
		const languageExtensions = {
			html: htmlSupport,
			css: cssSupport,
			javascript: javascriptSupport
		};

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged && !externalUpdate) {
				onchange?.(update.state.doc.toString());
			}
		});

		const baseTheme = EditorView.theme({
			'&': {
				height: '100%',
				fontSize: '13px',
				fontFamily: "'Share Tech Mono', ui-monospace, monospace"
			},
			'.cm-scroller': {
				overflow: 'auto'
			},
			'.cm-gutters': {
				backgroundColor: '#121212',
				borderRight: '1px solid #262626'
			}
		});

		createState = (lang, doc) =>
			EditorState.create({
				doc: doc || '',
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
					languageExtensions[lang] ?? languageExtensions.javascript,
					keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap, indentWithTab]),
					updateListener
				]
			});

		editorView = new EditorView({
			state: createState(currentLanguage, code),
			parent: editorContainer
		});
		editorStates.set(currentLanguage, editorView.state);

		// The component can be destroyed while the dynamic imports are pending.
		if (destroyed) {
			editorView.destroy();
			editorView = undefined;
			return;
		}
		ready = true;
	});

	onDestroy(() => {
		destroyed = true;
		editorView?.destroy();
	});

	// Swap between the per-tab states, or update the current document when the
	// code changes from the outside (Reset, restored progress, lesson switch).
	$effect(() => {
		const lang = language;
		const value = code ?? '';
		if (!ready || !editorView) return;

		if (lang !== currentLanguage) {
			editorStates.set(currentLanguage, editorView.state);
			editorView.setState(editorStates.get(lang) ?? createState(lang, value));
			currentLanguage = lang;
		}

		const currentDoc = editorView.state.doc.toString();
		if (currentDoc !== value) {
			externalUpdate = true;
			editorView.dispatch({
				changes: {
					from: 0,
					to: currentDoc.length,
					insert: value
				}
			});
			externalUpdate = false;
		}

		editorStates.set(lang, editorView.state);
	});
</script>

<div class="h-full overflow-hidden [&_.cm-editor]:h-full" bind:this={editorContainer}></div>
