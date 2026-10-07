<script>
	import { onDestroy, untrack } from 'svelte';
	import CodeEditor from './CodeEditor.svelte';
	import Preview from './Preview.svelte';
	import ConsolePanel from './Console.svelte';

	/** Console output is capped so a runaway lesson cannot grow the list forever. */
	const MAX_CONSOLE_MESSAGES = 500;

	/** Shared look for the toolbar buttons; each variant adds its own colours. */
	const ACTION_BUTTON =
		'clip-button cursor-pointer border px-3.5 py-[5px] text-[11px] font-bold tracking-wider uppercase transition-all duration-300';

	/**
	 * @type {{
	 *   lessonId: number,
	 *   starterCode: { html: string, css: string, javascript: string },
	 *   savedCode: { html: string, css: string, javascript: string } | null,
	 *   onsave: (lessonId: number, code: { html: string, css: string, javascript: string }) => void
	 * }}
	 */
	let { lessonId, starterCode, savedCode = null, onsave } = $props();

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

	// Console panel collapsed
	let consoleCollapsed = $state(false);

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

	function handleCodeChange(value) {
		const next = { ...code, [activeTab]: value };
		code = next;
		scheduleSave(next);
	}

	function handleRun() {
		consoleMessages = [];
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
		onsave?.(lessonId, code);
		// Force re-run after reset
		setTimeout(() => previewRef?.run(), 50);
	}

	function handleIframeMessage(msg) {
		const id = nextMessageId++;
		consoleMessages = [...consoleMessages, { id, type: msg.type, text: msg.args.join(' ') }].slice(
			-MAX_CONSOLE_MESSAGES
		);
	}

	function handleClearConsole() {
		consoleMessages = [];
	}
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden max-[900px]:h-[760px]">
	<!-- Editor -->
	<div class="flex min-h-0 flex-[3] flex-col border-b border-gray-800">
		<div
			class="flex flex-shrink-0 items-center justify-between border-b border-gray-800 bg-black/60 px-1"
		>
			<div class="flex gap-0" role="tablist" aria-label="Editor language">
				{#each tabs as tab (tab)}
					<button
						class="cursor-pointer border-b-2 bg-transparent px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 {activeTab ===
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
			<div class="flex gap-1.5 p-1">
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
			</div>
		</div>

		<div
			class="min-h-0 flex-1 overflow-hidden"
			role="tabpanel"
			aria-label={activeTab.toUpperCase()}
		>
			<CodeEditor code={code[activeTab]} language={activeTab} onchange={handleCodeChange} />
		</div>
	</div>

	<!-- Preview -->
	<div class="flex min-h-0 flex-[2] flex-col border-b border-gray-800">
		<div class="flex-shrink-0 border-b border-gray-800 bg-black/60 px-3 py-1.5">
			<span class="text-[11px] font-bold tracking-widest text-cyber-cyan uppercase">Preview</span>
		</div>
		<div class="min-h-0 flex-1">
			<Preview bind:this={previewRef} {code} onmessage={handleIframeMessage} />
		</div>
	</div>

	<!-- Console -->
	<div class="flex max-h-[220px] min-h-8 flex-shrink-0 flex-col {consoleCollapsed ? '' : 'h-32'}">
		<button
			class="w-full cursor-pointer items-center gap-1.5 border-t border-gray-800 bg-black/60 px-3 py-1.5 text-[11px] font-bold tracking-widest text-cyber-cyan uppercase max-[900px]:flex {consoleCollapsed
				? 'flex'
				: 'hidden'}"
			onclick={() => (consoleCollapsed = !consoleCollapsed)}
		>
			{consoleCollapsed ? '▲' : '▼'} Console
			{#if consoleMessages.length > 0}
				<span class="rounded-lg bg-surface-3 px-1.5 py-px text-[10px]">
					{consoleMessages.length}
				</span>
			{/if}
		</button>
		{#if !consoleCollapsed}
			<ConsolePanel
				messages={consoleMessages}
				onclear={handleClearConsole}
				oncollapse={() => (consoleCollapsed = true)}
			/>
		{/if}
	</div>
</div>
