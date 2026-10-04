<script>
	/**
	 * @type {{ messages: Array<{ type: string, text: string }> , onclear: () => void }}
	 */
	let { messages = [], onclear } = $props();

	let scrollContainer;

	$effect(() => {
		// Auto-scroll to bottom when messages change
		if (messages.length && scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	});
</script>

<div class="console-panel">
	<div class="console-header">
		<span class="console-title">Console</span>
		<span class="console-count">{messages.length}</span>
		<button class="console-clear" onclick={onclear} title="Clear console">✕</button>
	</div>
	<div class="console-messages" bind:this={scrollContainer}>
		{#if messages.length === 0}
			<div class="console-empty">No output yet. Run your code to see results here.</div>
		{:else}
			{#each messages as msg}
				<div class="console-msg console-{msg.type}">
					<span class="msg-prefix">
						{#if msg.type === 'warn'}⚠{:else if msg.type === 'error'}✕{:else}›{/if}
					</span>
					<span class="msg-text">{msg.text}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.console-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #0d0d1a;
		border-top: 1px solid var(--border, #2a2a44);
	}
	.console-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: var(--surface-1, #161628);
		border-bottom: 1px solid var(--border, #2a2a44);
		flex-shrink: 0;
	}
	.console-title {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary, #8888aa);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.console-count {
		font-size: 10px;
		background: var(--surface-3, #3a3a5c);
		color: var(--text-secondary, #8888aa);
		padding: 1px 6px;
		border-radius: 8px;
		font-variant-numeric: tabular-nums;
	}
	.console-clear {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--text-secondary, #666);
		cursor: pointer;
		font-size: 12px;
		padding: 2px 6px;
		border-radius: 3px;
	}
	.console-clear:hover {
		background: var(--surface-3, #3a3a5c);
		color: var(--text-primary, #e0e0e0);
	}
	.console-messages {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 12px;
		scrollbar-width: thin;
		scrollbar-color: var(--surface-3, #3a3a5c) transparent;
	}
	.console-empty {
		padding: 12px;
		color: var(--text-secondary, #555);
		font-style: italic;
		font-family: system-ui, sans-serif;
		font-size: 12px;
	}
	.console-msg {
		display: flex;
		gap: 8px;
		padding: 3px 12px;
		border-bottom: 1px solid rgba(42, 42, 68, 0.4);
		line-height: 1.5;
		word-break: break-word;
	}
	.console-msg:hover {
		background: rgba(42, 42, 68, 0.3);
	}
	.msg-prefix {
		flex-shrink: 0;
		width: 14px;
		text-align: center;
	}
	.msg-text {
		flex: 1;
		min-width: 0;
	}
	.console-log {
		color: #b0b0c8;
	}
	.console-log .msg-prefix {
		color: #6366f1;
	}
	.console-warn {
		color: #fbbf24;
		background: rgba(251, 191, 36, 0.05);
	}
	.console-error {
		color: #f87171;
		background: rgba(248, 113, 113, 0.05);
	}
</style>
