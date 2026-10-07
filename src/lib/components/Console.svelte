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
		log: 'text-gray-400',
		warn: 'bg-cyber-yellow/5 text-cyber-yellow',
		error: 'bg-cyber-magenta/10 text-cyber-magenta'
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

<div class="flex h-full flex-col border-t border-gray-800 bg-black">
	<div
		class="flex flex-shrink-0 items-center gap-2 border-b border-gray-800 bg-black/60 px-3 py-1.5"
	>
		<span class="text-[11px] font-bold tracking-widest text-cyber-cyan uppercase">Console</span>
		<span class="border border-gray-800 px-1.5 py-px text-[10px] text-gray-500 tabular-nums">
			{messages.length}
		</span>
		<div class="ml-auto flex items-center gap-1">
			{#if oncollapse}
				<button
					class="cursor-pointer border-none bg-transparent px-1.5 py-0.5 text-xs text-gray-500 hover:text-cyber-cyan"
					onclick={oncollapse}
					title="Collapse console"
					aria-label="Collapse console">▾</button
				>
			{/if}
			<button
				class="cursor-pointer border-none bg-transparent px-1.5 py-0.5 text-xs text-gray-500 hover:text-cyber-magenta"
				onclick={onclear}
				title="Clear console">✕</button
			>
		</div>
	</div>
	<div
		class="flex-1 [scrollbar-width:thin] [scrollbar-color:var(--color-cyber-yellow)_transparent] overflow-y-auto py-1 font-mono text-xs"
		bind:this={scrollContainer}
		role="log"
		aria-live="polite"
	>
		{#if messages.length === 0}
			<div class="p-3 font-sans text-xs text-gray-500 italic">
				No output yet. Run your code to see results here.
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				<div
					class="flex gap-2 border-b border-gray-800/60 px-3 py-0.5 leading-relaxed break-words hover:bg-white/5 {messageClass(
						msg.type
					)}"
				>
					<span
						class="w-3.5 flex-shrink-0 text-center {msg.type === 'log' ? 'text-cyber-cyan' : ''}"
					>
						{#if msg.type === 'warn'}⚠{:else if msg.type === 'error'}✕{:else}›{/if}
					</span>
					<span class="min-w-0 flex-1">{msg.text}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
