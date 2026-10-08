<script>
	import Console from './Console.svelte';

	/**
	 * @type {{
	 *   messages: Array<{ id: number, type: string, text: string }>,
	 *   open?: boolean,
	 *   pinned?: boolean,
	 *   onclear: () => void,
	 *   ontoggle?: () => void,
	 *   onpin?: () => void
	 * }}
	 */
	let { messages = [], open = false, pinned = false, onclear, ontoggle, onpin } = $props();

	const errorCount = $derived(messages.filter((message) => message.type === 'error').length);

	const CONTROL =
		'cursor-pointer border-none bg-transparent px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase transition-colors';
</script>

<div class="flex h-full min-h-0 flex-col bg-black">
	<div class="flex h-8 flex-shrink-0 items-center gap-2 border-b border-gray-800 bg-black/60 px-3">
		<button
			class="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-[11px] font-bold tracking-widest text-cyber-cyan uppercase transition-colors hover:text-white"
			onclick={ontoggle}
			aria-expanded={open}
			aria-controls="lab-console-log"
		>
			<span aria-hidden="true">{open ? '▾' : '▴'}</span>
			Console
		</button>
		<span class="border border-gray-800 px-1.5 py-px text-[10px] text-gray-500 tabular-nums">
			{messages.length}
		</span>
		{#if errorCount > 0}
			<span class="text-[10px] tracking-widest text-cyber-magenta uppercase">
				{errorCount} error{errorCount === 1 ? '' : 's'}
			</span>
		{/if}
		<div class="ml-auto flex items-center gap-1">
			{#if onpin}
				<button
					class="{CONTROL} {pinned
						? 'text-cyber-yellow hover:text-cyber-yellow'
						: 'text-gray-500 hover:text-cyber-cyan'}"
					onclick={onpin}
					aria-pressed={pinned}
					title={pinned ? 'Stop keeping the console open' : 'Keep the console open'}
				>
					{pinned ? '● pinned' : '○ pin'}
				</button>
			{/if}
			<button
				class="{CONTROL} text-gray-500 hover:text-cyber-magenta"
				onclick={onclear}
				title="Clear console"
				aria-label="Clear console">✕</button
			>
		</div>
	</div>
	{#if open}
		<Console {messages} />
	{/if}
</div>
