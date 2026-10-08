<script>
	/**
	 * The console log itself: a scrollable list of captured messages. The header
	 * (counter, pin, clear) lives in ConsoleDrawer, which also owns the collapse
	 * state, so this component stays a pure view of `messages`.
	 *
	 * @type {{ messages?: Array<{ id: number, type: string, text: string }> }}
	 */
	let { messages = [] } = $props();

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

<div
	id="lab-console-log"
	class="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--color-cyber-yellow)_transparent] overflow-y-auto py-1 font-mono text-xs"
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
				<span class="w-3.5 flex-shrink-0 text-center {msg.type === 'log' ? 'text-cyber-cyan' : ''}">
					{#if msg.type === 'warn'}⚠{:else if msg.type === 'error'}✕{:else}›{/if}
				</span>
				<span class="min-w-0 flex-1">{msg.text}</span>
			</div>
		{/each}
	{/if}
</div>
