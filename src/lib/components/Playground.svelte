<script>
	import { onDestroy, untrack } from 'svelte';
	import CodeEditor from './CodeEditor.svelte';
	import Preview from './Preview.svelte';
	import ConsolePanel from './Console.svelte';

	/** Console output is capped so a runaway lesson cannot grow the list forever. */
	const MAX_CONSOLE_MESSAGES = 500;

	/** Shared look for the toolbar buttons; each variant adds its own colours. */
	const ACTION_BUTTON =
		'cursor-pointer rounded-[5px] border px-3.5 py-[5px] text-xs font-semibold transition-all duration-150';

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
	<div class="flex min-h-0 flex-[3] flex-col border-b border-line">
		<div
			class="flex flex-shrink-0 items-center justify-between border-b border-line bg-surface-1 px-1"
		>
			<div class="flex gap-0" role="tablist" aria-label="Editor language">
				{#each tabs as tab (tab)}
					<button
						class="cursor-pointer border-b-2 bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.5px] transition-all duration-150 {activeTab ===
						tab
							? 'border-b-accent text-accent'
							: 'border-b-transparent text-muted hover:text-[#c0c0d8]'}"
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
					class="{ACTION_BUTTON} border-[#2d6a4f] bg-[#2d6a4f] text-[#a7f3d0] hover:bg-[#40916c]"
					onclick={handleRun}
					title="Run code"
				>
					▶ Run
				</button>
				<button
					class="{ACTION_BUTTON} border-line bg-surface-2 text-muted hover:bg-surface-3 hover:text-ink"
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
	<div class="flex min-h-0 flex-[2] flex-col border-b border-line">
		<div class="flex-shrink-0 border-b border-line bg-surface-1 px-3 py-1.5">
			<span class="text-xs font-semibold tracking-[0.5px] text-muted uppercase">Preview</span>
		</div>
		<div class="min-h-0 flex-1">
			<Preview bind:this={previewRef} {code} onmessage={handleIframeMessage} />
		</div>
	</div>

	<!-- Console -->
	<div class="flex max-h-[220px] min-h-8 flex-shrink-0 flex-col {consoleCollapsed ? '' : 'h-32'}">
		<button
			class="w-full cursor-pointer items-center gap-1.5 border-t border-line bg-surface-1 px-3 py-1.5 text-xs font-semibold tracking-[0.5px] text-muted uppercase max-[900px]:flex {consoleCollapsed
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
