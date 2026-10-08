<script>
	import { onDestroy, untrack } from 'svelte';
	import CodeEditor from './CodeEditor.svelte';
	import Preview from './Preview.svelte';
	import ConsoleDrawer from './ConsoleDrawer.svelte';
	import Splitter from './Splitter.svelte';
	import {
		CONSOLE_COLLAPSED_HEIGHT,
		CONSOLE_HEIGHT,
		EDITOR_WIDTH,
		LESSON_WIDTH,
		loadLabLayout,
		saveLabLayout
	} from '#lib/stores/labLayout.js';

	/** Console output is capped so a runaway lesson cannot grow the list forever. */
	const MAX_CONSOLE_MESSAGES = 500;

	/** Below this width the three columns stop being usable and tabs take over. */
	const NARROW_QUERY = '(max-width: 1099px)';
	/** Two 6px splitters sit between the three columns. */
	const SPLITTER_TOTAL = 12;
	/** The preview never gets narrower than this, whatever the splitters say. */
	const PREVIEW_MIN = 280;
	/** Width of the lesson strip in focus mode. */
	const FOCUS_STRIP = 40;

	const ACTION_BUTTON =
		'clip-button cursor-pointer border px-3.5 py-[5px] text-[11px] font-bold tracking-wider uppercase transition-all duration-300';
	const ICON_BUTTON =
		'cursor-pointer border border-gray-800 bg-black/40 px-2 py-[3px] text-[11px] leading-none text-gray-400 transition-colors hover:border-cyber-cyan hover:text-cyber-cyan aria-pressed:border-cyber-yellow aria-pressed:text-cyber-yellow';

	/**
	 * @type {{
	 *   lessonId: number,
	 *   starterCode: { html: string, css: string, javascript: string },
	 *   savedCode: { html: string, css: string, javascript: string } | null,
	 *   onsave: (lessonId: number, code: { html: string, css: string, javascript: string }) => void,
	 *   lessonColumn?: any,
	 *   focus?: boolean
	 * }}
	 */
	let {
		lessonId,
		starterCode,
		savedCode = null,
		onsave,
		lessonColumn,
		focus = $bindable(false)
	} = $props();

	const initialLayout = untrack(() => loadLabLayout());

	// Active tab
	let activeTab = $state('javascript');
	const tabs = ['html', 'css', 'javascript'];

	// Code state — initialized ONCE from saved or starter.
	// The parent remounts this component per lesson ({#key lesson.id}),
	// so no $effect is needed to track lesson switches. This intentionally
	// avoids re-running on parent `savedCode` updates (which happen on every
	// keystroke via onsave) — that would wipe the console while typing.
	const initialCode = untrack(() => savedCode ?? starterCode);
	let code = $state({
		html: initialCode.html,
		css: initialCode.css,
		javascript: initialCode.javascript
	});

	// Console messages
	let consoleMessages = $state([]);
	let nextMessageId = 0;

	// Preview component ref
	let previewRef;

	// Console: collapsed by default, opens itself when there is something to read.
	let consoleOpen = $state(false);
	let consolePinned = $state(initialLayout.consolePinned);
	let consoleHeight = $state(initialLayout.consoleH ?? CONSOLE_HEIGHT.fallback);

	// Workspace layout
	let lessonW = $state(initialLayout.lessonW ?? LESSON_WIDTH.fallback);
	let editorW = $state(initialLayout.editorW);
	let fitPreview = $state(initialLayout.fitPreview);
	let maximized = $state(/** @type {null | 'editor' | 'preview'} */ (null));
	let narrow = $state(false);
	let pane = $state(/** @type {'lesson' | 'code' | 'preview'} */ ('lesson'));

	// Measured sizes, so the splitters know where a drag starts and how far it can go.
	let workspaceWidth = $state(0);
	let workspaceHeight = $state(0);
	let editorMeasured = $state(0);

	const consoleRowHeight = $derived(consoleOpen ? consoleHeight : CONSOLE_COLLAPSED_HEIGHT);
	/** The splitters need a concrete number even when the column uses the default ratio. */
	const editorSplitValue = $derived(editorW ?? editorMeasured ?? 640);
	const editorMax = $derived(
		Math.max(EDITOR_WIDTH.min, workspaceWidth - lessonW - PREVIEW_MIN - SPLITTER_TOTAL)
	);
	const consoleMax = $derived(
		Math.max(CONSOLE_HEIGHT.min, Math.min(CONSOLE_HEIGHT.max, workspaceHeight - 200))
	);

	/**
	 * The whole workspace is one grid; the column widths are runtime numbers, so
	 * the track list is inline. Everything else about the layout lives in CSS.
	 */
	const gridColumns = $derived(
		maximized
			? 'minmax(0, 1fr)'
			: [
					focus ? `${FOCUS_STRIP}px` : `${lessonW}px`,
					'6px',
					editorW === null ? 'minmax(0, 1.2fr)' : `minmax(0, ${editorW}px)`,
					'6px',
					'minmax(0, 1fr)'
				].join(' ')
	);

	const panes = [
		{ id: /** @type {const} */ ('lesson'), label: 'Lesson' },
		{ id: /** @type {const} */ ('code'), label: 'Code' },
		{ id: /** @type {const} */ ('preview'), label: 'Preview' }
	];

	// Debounced save — avoids writing to localStorage on every keystroke.
	// The lesson id is captured when the edit happens, so a pending save can
	// never be attributed to whichever lesson happens to be open when the
	// timer fires (the old bug wrote lesson A's code into lesson B).
	/** @type {{ lessonId: number, code: { html: string, css: string, javascript: string } } | null} */
	let pendingSave = null;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let saveTimer;

	function scheduleSave(nextCode) {
		pendingSave = { lessonId, code: nextCode };
		clearTimeout(saveTimer);
		saveTimer = setTimeout(flushSave, 500);
	}

	function cancelPendingSave() {
		clearTimeout(saveTimer);
		saveTimer = undefined;
		pendingSave = null;
	}

	function flushSave() {
		clearTimeout(saveTimer);
		saveTimer = undefined;
		if (!pendingSave) return;
		const { lessonId: id, code: pendingCode } = pendingSave;
		pendingSave = null;
		onsave?.(id, pendingCode);
	}

	// Flush (instead of dropping) the last keystrokes when the lesson changes.
	onDestroy(flushSave);

	// ── Layout persistence (its own key; never touches progress) ──
	let layoutTimer;

	function persistLayout() {
		saveLabLayout({
			lessonW,
			editorW,
			consoleH: consoleHeight,
			consolePinned,
			fitPreview
		});
	}

	$effect(() => {
		// Track every persisted field.
		void [lessonW, editorW, consoleHeight, consolePinned, fitPreview];

		clearTimeout(layoutTimer);
		layoutTimer = setTimeout(persistLayout, 150);
	});

	onDestroy(() => {
		clearTimeout(layoutTimer);
		persistLayout();
	});

	// A stored editor width that no longer fits (smaller window, wider lesson
	// column) would squeeze the preview out of the grid, so it is clamped back.
	$effect(() => {
		if (editorW === null || !workspaceWidth) return;
		if (editorW > editorMax) editorW = Math.max(EDITOR_WIDTH.min, editorMax);
	});

	// Responsive switch: below the breakpoint the panes become tabs.
	$effect(() => {
		const query = window.matchMedia(NARROW_QUERY);
		const update = () => (narrow = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	function handleCodeChange(value) {
		const next = { ...code, [activeTab]: value };
		code = next;
		scheduleSave(next);
	}

	function handleRun() {
		consoleMessages = [];
		// Logs are about to arrive: show them instead of hiding them behind a counter.
		consoleOpen = true;
		previewRef?.run();
	}

	function handleReset() {
		cancelPendingSave();
		code = {
			html: starterCode.html,
			css: starterCode.css,
			javascript: starterCode.javascript
		};
		consoleMessages = [];
		consoleOpen = true;
		onsave?.(lessonId, code);
		// Force re-run after reset
		setTimeout(() => previewRef?.run(), 50);
	}

	function handleIframeMessage(msg) {
		const id = nextMessageId++;
		consoleMessages = [...consoleMessages, { id, type: msg.type, text: msg.args.join(' ') }].slice(
			-MAX_CONSOLE_MESSAGES
		);
		if (msg.type === 'error') consoleOpen = true;
	}

	function handleClearConsole() {
		consoleMessages = [];
	}

	function handleToggleConsole() {
		if (consoleOpen) {
			consoleOpen = false;
			consolePinned = false;
		} else {
			consoleOpen = true;
		}
	}

	function handlePinConsole() {
		consolePinned = !consolePinned;
		if (consolePinned) consoleOpen = true;
	}
</script>

{#snippet maximizeButton(target, label)}
	<button
		class={ICON_BUTTON}
		onclick={() => (maximized = maximized === target ? null : target)}
		aria-pressed={maximized === target}
		aria-label={maximized === target ? `Restore ${label} panel` : `Maximize ${label} panel`}
		title={maximized === target ? 'Restore panel' : 'Maximize panel'}
	>
		<span aria-hidden="true">{maximized === target ? '⤡' : '⤢'}</span>
	</button>
{/snippet}

{#snippet lessonPane()}
	<section
		class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-gray-800 bg-cyber-surface"
	>
		{#if focus && !narrow}
			<div class="flex h-full flex-col items-center gap-3 py-3">
				<button
					class={ICON_BUTTON}
					onclick={() => (focus = false)}
					aria-label="Expand lesson panel"
					title="Expand lesson panel"
				>
					<span aria-hidden="true">»</span>
				</button>
				<span class="lab-strip-label text-[10px] tracking-widest text-gray-500 uppercase">
					Lesson
				</span>
			</div>
		{:else}
			{@render lessonColumn?.()}
		{/if}
	</section>
{/snippet}

{#snippet editorPane()}
	<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-black">
		<div
			class="flex h-9 flex-shrink-0 items-center justify-between gap-2 border-b border-gray-800 bg-black/60 px-1"
		>
			<div class="flex gap-0" role="tablist" aria-label="Editor language">
				{#each tabs as tab (tab)}
					<button
						class="cursor-pointer border-b-2 bg-transparent px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 {activeTab ===
						tab
							? 'border-b-cyber-yellow text-cyber-yellow'
							: 'border-b-transparent text-gray-500 hover:text-cyber-cyan'}"
						role="tab"
						aria-selected={activeTab === tab}
						onclick={() => (activeTab = tab)}
					>
						{tab.toUpperCase()}
					</button>
				{/each}
			</div>
			<div class="flex items-center gap-1.5 p-1">
				<button
					class="{ACTION_BUTTON} border-cyber-yellow bg-cyber-yellow text-black hover:bg-cyber-cyan hover:shadow-neon-cyan"
					onclick={handleRun}
					title="Run code"
				>
					▶ Run
				</button>
				<button
					class="{ACTION_BUTTON} border-cyber-cyan bg-transparent text-cyber-cyan hover:bg-cyber-cyan hover:text-black hover:shadow-neon-cyan"
					onclick={handleReset}
					title="Reset to starter code"
				>
					↺ Reset
				</button>
				{@render maximizeButton('editor', 'editor')}
			</div>
		</div>

		<div
			class="min-h-0 flex-1 overflow-hidden"
			role="tabpanel"
			aria-label={activeTab.toUpperCase()}
			bind:clientWidth={editorMeasured}
		>
			<CodeEditor code={code[activeTab]} language={activeTab} onchange={handleCodeChange} />
		</div>
	</section>
{/snippet}

{#snippet previewPane()}
	<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-black">
		<div class="flex min-h-0 flex-1 flex-col">
			<div
				class="flex h-8 flex-shrink-0 items-center justify-between gap-2 border-b border-gray-800 bg-black/60 px-3"
			>
				<span class="text-[11px] font-bold tracking-widest text-cyber-cyan uppercase">
					Preview
				</span>
				<div class="flex items-center gap-1.5">
					<div class="flex" role="group" aria-label="Preview zoom">
						<button
							class="cursor-pointer border px-2 py-[3px] text-[10px] tracking-widest uppercase transition-colors {fitPreview
								? 'border-cyber-cyan text-cyber-cyan'
								: 'border-gray-800 text-gray-500 hover:text-cyber-cyan'}"
							onclick={() => (fitPreview = true)}
							aria-pressed={fitPreview}
							title="Scale the lesson down to fit the panel"
						>
							Fit
						</button>
						<button
							class="cursor-pointer border border-l-0 px-2 py-[3px] text-[10px] tracking-widest uppercase transition-colors {!fitPreview
								? 'border-cyber-cyan text-cyber-cyan'
								: 'border-gray-800 text-gray-500 hover:text-cyber-cyan'}"
							onclick={() => (fitPreview = false)}
							aria-pressed={!fitPreview}
							title="Show the lesson at its real size, with scroll"
						>
							100%
						</button>
					</div>
					{@render maximizeButton('preview', 'preview')}
				</div>
			</div>
			<div class="min-h-0 flex-1">
				<Preview bind:this={previewRef} {code} onmessage={handleIframeMessage} fit={fitPreview} />
			</div>
		</div>

		{#if consoleOpen}
			<Splitter
				orientation="horizontal"
				invert
				value={consoleHeight}
				min={CONSOLE_HEIGHT.min}
				max={consoleMax}
				label="Resize console"
				onchange={(next) => (consoleHeight = next)}
				onreset={() => (consoleHeight = CONSOLE_HEIGHT.fallback)}
			/>
		{/if}
		<div class="flex-shrink-0" style="height: {consoleRowHeight}px">
			<ConsoleDrawer
				messages={consoleMessages}
				open={consoleOpen}
				pinned={consolePinned}
				onclear={handleClearConsole}
				ontoggle={handleToggleConsole}
				onpin={handlePinConsole}
			/>
		</div>
	</section>
{/snippet}

<div
	class="flex min-h-0 flex-1 flex-col overflow-hidden"
	bind:clientWidth={workspaceWidth}
	bind:clientHeight={workspaceHeight}
>
	{#if narrow}
		<div
			class="flex h-9 flex-shrink-0 items-center gap-1 border-b border-gray-800 bg-black/60 px-2"
			role="tablist"
			aria-label="Workspace"
		>
			{#each panes as entry (entry.id)}
				<button
					class="clip-button cursor-pointer border px-3 py-1 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 {pane ===
					entry.id
						? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow'
						: 'border-gray-800 bg-black/40 text-gray-500 hover:text-cyber-cyan'}"
					role="tab"
					aria-selected={pane === entry.id}
					onclick={() => (pane = entry.id)}
				>
					{entry.label}
				</button>
			{/each}
		</div>
		<div class="min-h-0 flex-1 overflow-hidden">
			<!--
				All three panes stay mounted and the inactive ones are hidden, so
				switching tabs never re-runs the lesson or resets the editor.
			-->
			<div class="h-full" class:hidden={pane !== 'lesson'}>
				{@render lessonPane()}
			</div>
			<div class="h-full" class:hidden={pane !== 'code'}>
				{@render editorPane()}
			</div>
			<div class="h-full" class:hidden={pane !== 'preview'}>
				{@render previewPane()}
			</div>
		</div>
	{:else}
		<div class="grid min-h-0 flex-1 overflow-hidden" style="grid-template-columns: {gridColumns};">
			{#if maximized === 'editor'}
				{@render editorPane()}
			{:else if maximized === 'preview'}
				{@render previewPane()}
			{:else}
				{@render lessonPane()}
				{#if focus}
					<div aria-hidden="true"></div>
				{:else}
					<Splitter
						value={lessonW}
						min={LESSON_WIDTH.min}
						max={LESSON_WIDTH.max}
						label="Resize lesson panel"
						onchange={(next) => (lessonW = next)}
						onreset={() => (lessonW = LESSON_WIDTH.fallback)}
					/>
				{/if}
				{@render editorPane()}
				<Splitter
					value={editorSplitValue}
					min={EDITOR_WIDTH.min}
					max={editorMax}
					label="Resize editor and preview"
					onchange={(next) => (editorW = next)}
					onreset={() => (editorW = null)}
				/>
				{@render previewPane()}
			{/if}
		</div>
	{/if}
</div>
