<script>
	/** @type {{ position: number, total: number, onprevious: () => void, onnext: () => void, isCompleted: boolean }} */
	let { position, total, onprevious, onnext, isCompleted = false } = $props();

	const NAV_BUTTON =
		'clip-button cursor-pointer border border-cyber-cyan bg-transparent px-4 py-1.5 text-[11px] font-bold tracking-wider whitespace-nowrap text-cyber-cyan uppercase transition-all duration-300 hover:enabled:bg-cyber-cyan hover:enabled:text-black hover:enabled:shadow-neon-cyan disabled:cursor-not-allowed disabled:opacity-30';
</script>

<nav class="flex items-center justify-between gap-3 px-1">
	<button class={NAV_BUTTON} onclick={onprevious} disabled={position <= 1}>← Previous</button>

	<div class="flex items-baseline gap-1 text-[11px] tracking-widest text-gray-500 uppercase">
		<span class="mr-0.5">Lesson</span>
		<span class="text-lg font-bold text-cyber-yellow tabular-nums">{position}</span>
		<span class="opacity-40">/</span>
		<span class="tabular-nums">{total}</span>
		{#if isCompleted}
			<span class="ml-1 text-sm text-cyber-cyan" title="Completed">✓</span>
		{/if}
	</div>

	<button class={NAV_BUTTON} onclick={onnext} disabled={position >= total}>Next →</button>
</nav>
