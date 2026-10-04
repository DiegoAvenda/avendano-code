<script>
	import CodeEditor from './CodeEditor.svelte';
	import Preview from './Preview.svelte';
	import ConsolePanel from './Console.svelte';

	/**
	 * @type {{
	 *   starterCode: { html: string, css: string, javascript: string },
	 *   savedCode: { html: string, css: string, javascript: string } | null,
	 *   onsave: (code: { html: string, css: string, javascript: string }) => void
	 * }}
	 */
	let { starterCode, savedCode = null, onsave } = $props();

	// Active tab
	let activeTab = $state('javascript');
	const tabs = ['html', 'css', 'javascript'];

	// Code state — initialize from saved or starter
	let code = $state({
		html: savedCode?.html ?? starterCode.html,
		css: savedCode?.css ?? starterCode.css,
		javascript: savedCode?.javascript ?? starterCode.javascript
	});

	// Console messages
	let consoleMessages = $state([]);

	// Preview component ref
	let previewRef;

	// Console panel collapsed
	let consoleCollapsed = $state(false);

	function handleCodeChange(value) {
		code = { ...code, [activeTab]: value };
		onsave?.(code);
	}

	function handleRun() {
		consoleMessages = [];
		previewRef?.run();
	}

	function handleReset() {
		code = {
			html: starterCode.html,
			css: starterCode.css,
			javascript: starterCode.javascript
		};
		consoleMessages = [];
		onsave?.(code);
		// Force re-run after reset
		setTimeout(() => previewRef?.run(), 50);
	}

	function handleIframeMessage(msg) {
		consoleMessages = [
			...consoleMessages,
			{ type: msg.type, text: msg.args.join(' ') }
		];
	}

	function handleClearConsole() {
		consoleMessages = [];
	}

	// When starterCode changes (lesson switch), reset the editor
	$effect(() => {
		const _s = starterCode;
		code = {
			html: savedCode?.html ?? _s.html,
			css: savedCode?.css ?? _s.css,
			javascript: savedCode?.javascript ?? _s.javascript
		};
		consoleMessages = [];
	});
</script>

<div class="playground">
	<!-- Editor Section -->
	<div class="editor-section">
		<div class="editor-toolbar">
			<div class="tab-bar">
				{#each tabs as tab}
					<button
						class="tab-btn"
						class:active={activeTab === tab}
						onclick={() => (activeTab = tab)}
					>
						{tab.toUpperCase()}
					</button>
				{/each}
			</div>
			<div class="editor-actions">
				<button class="action-btn run-btn" onclick={handleRun} title="Run code">
					▶ Run
				</button>
				<button class="action-btn reset-btn" onclick={handleReset} title="Reset to starter code">
					↺ Reset
				</button>
			</div>
		</div>

		<div class="editor-container">
			{#key activeTab + starterCode.html}
				<CodeEditor
					code={code[activeTab]}
					language={activeTab}
					onchange={handleCodeChange}
				/>
			{/key}
		</div>
	</div>

	<!-- Preview Section -->
	<div class="preview-section">
		<div class="preview-header">
			<span class="preview-title">Preview</span>
		</div>
		<div class="preview-body">
			<Preview
				bind:this={previewRef}
				{code}
				onmessage={handleIframeMessage}
			/>
		</div>
	</div>

	<!-- Console Section -->
	<div class="console-section" class:collapsed={consoleCollapsed}>
		<button
			class="console-toggle"
			onclick={() => (consoleCollapsed = !consoleCollapsed)}
		>
			{consoleCollapsed ? '▲' : '▼'} Console
			{#if consoleMessages.length > 0}
				<span class="badge">{consoleMessages.length}</span>
			{/if}
		</button>
		{#if !consoleCollapsed}
			<ConsolePanel
				messages={consoleMessages}
				onclear={handleClearConsole}
			/>
		{/if}
	</div>
</div>

<style>
	.playground {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	/* ── Editor ── */
	.editor-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		border-bottom: 1px solid var(--border, #2a2a44);
	}
	.editor-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4px;
		background: var(--surface-1, #161628);
		border-bottom: 1px solid var(--border, #2a2a44);
		flex-shrink: 0;
	}
	.tab-bar {
		display: flex;
		gap: 0;
	}
	.tab-btn {
		background: none;
		border: none;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary, #6666880);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.15s;
		letter-spacing: 0.5px;
	}
	.tab-btn:hover {
		color: var(--text-primary, #c0c0d8);
	}
	.tab-btn.active {
		color: var(--accent, #8b8bcc);
		border-bottom-color: var(--accent, #8b8bcc);
	}
	.editor-actions {
		display: flex;
		gap: 6px;
		padding: 4px;
	}
	.action-btn {
		padding: 5px 14px;
		border-radius: 5px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--border, #3a3a5c);
		transition: all 0.15s;
	}
	.run-btn {
		background: #2d6a4f;
		color: #a7f3d0;
		border-color: #2d6a4f;
	}
	.run-btn:hover {
		background: #40916c;
	}
	.reset-btn {
		background: var(--surface-2, #2a2a44);
		color: var(--text-secondary, #8888aa);
	}
	.reset-btn:hover {
		background: var(--surface-3, #3a3a5c);
		color: var(--text-primary, #e0e0e0);
	}
	.editor-container {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	/* ── Preview ── */
	.preview-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 200px;
		border-bottom: 1px solid var(--border, #2a2a44);
	}
	.preview-header {
		padding: 6px 12px;
		background: var(--surface-1, #161628);
		border-bottom: 1px solid var(--border, #2a2a44);
		flex-shrink: 0;
	}
	.preview-title {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary, #8888aa);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.preview-body {
		flex: 1;
		min-height: 0;
	}

	/* ── Console ── */
	.console-section {
		flex-shrink: 0;
		min-height: 32px;
		max-height: 200px;
		display: flex;
		flex-direction: column;
	}
	.console-section:not(.collapsed) {
		height: 160px;
	}
	.console-toggle {
		display: none;
	}

	/* On smaller viewports, show toggle */
	@media (max-width: 900px) {
		.console-toggle {
			display: flex;
			align-items: center;
			gap: 6px;
			width: 100%;
			background: var(--surface-1, #161628);
			border: none;
			border-top: 1px solid var(--border, #2a2a44);
			color: var(--text-secondary, #8888aa);
			padding: 6px 12px;
			font-size: 12px;
			font-weight: 600;
			cursor: pointer;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.badge {
			background: var(--surface-3, #3a3a5c);
			padding: 1px 6px;
			border-radius: 8px;
			font-size: 10px;
		}
	}
</style>
