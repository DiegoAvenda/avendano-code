<script>
	/**
	 * @type {{
	 *   messages: Array<{ id: number, type: string, text: string }>,
	 *   onclear: () => void,
	 *   oncollapse?: () => void
	 * }}
	 */
	let { messages = [], onclear, oncollapse } = $props();

	/** Full class strings so Tailwind can see them while scanning. */
	const MESSAGE_CLASSES = {
		log: 'text-[#b0b0c8]',
		warn: 'bg-[rgba(251,191,36,0.05)] text-[#fbbf24]',
		error: 'bg-[rgba(248,113,113,0.05)] text-[#f87171]'
	};

	/** @param {string} type */
	function messageClass(type) {
		return MESSAGE_CLASSES[type] ?? MESSAGE_CLASSES.log;
	}

	let scrollContainer;

	$effect(() => {
		// Auto-scroll to bottom when messages change
		if (messages.length && scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	});
</script>

<div class="flex h-full flex-col border-t border-line bg-[#0d0d1a]">
	<div class="flex flex-shrink-0 items-center gap-2 border-b border-line bg-surface-1 px-3 py-1.5">
		<span class="text-xs font-semibold tracking-wide text-muted uppercase">Console</span>
		<span class="rounded-lg bg-surface-3 px-1.5 py-px text-[10px] text-muted tabular-nums">
			{messages.length}
		</span>
		<div class="ml-auto flex items-center gap-1">
			{#if oncollapse}
				<button
					class="cursor-pointer rounded-[3px] border-none bg-transparent px-1.5 py-0.5 text-xs text-muted hover:bg-surface-3 hover:text-ink"
					onclick={oncollapse}
					title="Collapse console"
					aria-label="Collapse console">▾</button
				>
			{/if}
			<button
				class="cursor-pointer rounded-[3px] border-none bg-transparent px-1.5 py-0.5 text-xs text-muted hover:bg-surface-3 hover:text-ink"
				onclick={onclear}
				title="Clear console">✕</button
			>
		</div>
	</div>
	<div
		class="flex-1 [scrollbar-width:thin] [scrollbar-color:var(--color-surface-3)_transparent] overflow-y-auto py-1 font-mono text-xs"
		bind:this={scrollContainer}
		role="log"
		aria-live="polite"
	>
		{#if messages.length === 0}
			<div class="p-3 font-sans text-xs text-muted italic">
				No output yet. Run your code to see results here.
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				<div
					class="flex gap-2 border-b border-line/40 px-3 py-0.5 leading-relaxed break-words hover:bg-surface-2/30 {messageClass(
						msg.type
					)}"
				>
					<span
						class="w-3.5 flex-shrink-0 text-center {msg.type === 'log' ? 'text-[#6366f1]' : ''}"
					>
						{#if msg.type === 'warn'}⚠{:else if msg.type === 'error'}✕{:else}›{/if}
					</span>
					<span class="min-w-0 flex-1">{msg.text}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
