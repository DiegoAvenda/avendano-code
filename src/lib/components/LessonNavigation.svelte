<script>
	/** @type {{ position: number, total: number, onprevious: () => void, onnext: () => void, isCompleted: boolean }} */
	let { position, total, onprevious, onnext, isCompleted = false } = $props();

	const NAV_BUTTON =
		'cursor-pointer rounded-md border border-line bg-surface-2 px-4 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink transition-colors hover:enabled:border-accent hover:enabled:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-30';
</script>

<nav class="flex items-center justify-between gap-3 px-1">
	<button class={NAV_BUTTON} onclick={onprevious} disabled={position <= 1}>← Previous</button>

	<div class="flex items-baseline gap-1 text-[13px] text-muted">
		<span class="mr-0.5 font-medium">Lesson</span>
		<span class="text-lg font-bold text-accent tabular-nums">{position}</span>
		<span class="opacity-40">/</span>
		<span class="tabular-nums">{total}</span>
		{#if isCompleted}
			<span class="ml-1 text-sm text-[#4ade80]" title="Completed">✓</span>
		{/if}
	</div>

	<button class={NAV_BUTTON} onclick={onnext} disabled={position >= total}>Next →</button>
</nav>
