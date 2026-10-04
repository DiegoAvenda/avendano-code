<script>
	/** @type {{ lesson: any, totalLessons: number, onprevious: () => void, onnext: () => void, isCompleted: boolean }} */
	let { lesson, totalLessons, onprevious, onnext, isCompleted = false } = $props();
</script>

<nav class="lesson-nav">
	<button onclick={onprevious} disabled={lesson.id <= 1} class="nav-btn">
		← Previous
	</button>

	<div class="lesson-counter">
		<span class="counter-label">Lesson</span>
		<span class="counter-number">{lesson.id}</span>
		<span class="counter-sep">/</span>
		<span class="counter-total">{totalLessons}</span>
		{#if isCompleted}
			<span class="check" title="Completed">✓</span>
		{/if}
	</div>

	<button onclick={onnext} disabled={lesson.id >= totalLessons} class="nav-btn">
		Next →
	</button>
</nav>

<style>
	.lesson-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 0 4px;
	}
	.nav-btn {
		background: var(--surface-2, #2a2a44);
		color: var(--text-primary, #e0e0e0);
		border: 1px solid var(--border, #3a3a5c);
		padding: 6px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.nav-btn:hover:not(:disabled) {
		background: var(--surface-3, #3a3a5c);
		border-color: var(--accent, #8b8bcc);
	}
	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	.lesson-counter {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-size: 13px;
		color: var(--text-secondary, #8888aa);
	}
	.counter-label {
		font-weight: 500;
		margin-right: 2px;
	}
	.counter-number {
		font-size: 18px;
		font-weight: 700;
		color: var(--accent, #8b8bcc);
		font-variant-numeric: tabular-nums;
	}
	.counter-sep {
		opacity: 0.4;
	}
	.counter-total {
		font-variant-numeric: tabular-nums;
	}
	.check {
		color: #4ade80;
		font-size: 14px;
		margin-left: 4px;
	}
</style>
