<script>
	import LessonPanel from '#lib/components/LessonPanel.svelte';
	import Playground from '#lib/components/Playground.svelte';
	import LessonNavigation from '#lib/components/LessonNavigation.svelte';
	import { lessons, projectMeta } from '#lib/content/pixel-editor/lessons.js';
	import { createProgressStore } from '#lib/stores/progress.svelte.js';

	const progress = createProgressStore();

	const initialId = progress.currentLesson ?? 1;
	let currentId = $state(initialId >= 1 && initialId <= lessons.length ? initialId : 1);

	let lesson = $derived(lessons.find((l) => l.id === currentId) ?? lessons[0]);
	let savedCode = $derived(progress.getEditorContents(currentId));
	let completed = $derived(progress.isCompleted(currentId));

	function goPrevious() {
		if (currentId > 1) currentId = currentId - 1;
	}

	function goNext() {
		if (currentId < lessons.length) currentId = currentId + 1;
	}

	function handleSave(code) {
		progress.saveEditorContents(currentId, code);
	}

	function toggleComplete() {
		progress.markCompleted(currentId);
	}

	// Persist current lesson whenever it changes
	$effect(() => {
		progress.currentLesson = currentId;
	});
</script>

<svelte:head>
	<title>{projectMeta.title} — Frontend Data Structures Lab</title>
</svelte:head>

<div class="app">
	<header class="app-header">
		<div class="header-left">
			<h1 class="app-title">Frontend Data Structures Lab</h1>
			<p class="app-subtitle">Project: {projectMeta.title}</p>
		</div>
		<div class="header-right">
			<LessonNavigation
				{lesson}
				totalLessons={lessons.length}
				onprevious={goPrevious}
				onnext={goNext}
				isCompleted={completed}
			/>
		</div>
	</header>

	<div class="lesson-progress-bar">
		<div class="progress-track">
			{#each lessons as l}
				<button
					class="progress-dot"
					class:done={progress.isCompleted(l.id)}
					class:active={l.id === currentId}
					onclick={() => (currentId = l.id)}
					title={l.id + '. ' + l.title}
					aria-label={'Go to lesson ' + l.id}
				></button>
			{/each}
		</div>
		<button class="complete-btn" onclick={toggleComplete}>
			{completed ? '✓ Completed' : 'Mark complete'}
		</button>
	</div>

	<main class="app-main">
		<section class="lesson-col">
			<LessonPanel {lesson} />
		</section>
		<section class="playground-col">
			{#key lesson.id}
				<Playground starterCode={lesson.starterCode} {savedCode} onsave={handleSave} />
			{/key}
		</section>
	</main>

	<footer class="app-footer">
		<span>Vanilla JS + DOM + Canvas in the preview · SvelteKit shell · No backend</span>
		<span>Progress saved in localStorage</span>
	</footer>
</div>

<style>
	:global(:root) {
		--bg: #0f0f1e;
		--surface-1: #161628;
		--surface-2: #1e1e34;
		--surface-3: #3a3a5c;
		--border: #2a2a44;
		--text-primary: #e8e8f0;
		--text-secondary: #8888aa;
		--accent: #8b8bcc;
	}
	:global(body) {
		background: var(--bg);
		color: var(--text-primary);
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
	}
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		min-height: 100vh;
		background: var(--bg);
	}
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 20px;
		background: var(--surface-1);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		flex-wrap: wrap;
	}
	.app-title {
		font-size: 17px;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.01em;
	}
	.app-subtitle {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 2px 0 0;
	}
	.header-right {
		min-width: 260px;
	}
	.lesson-progress-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 20px;
		background: var(--surface-1);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.progress-track {
		display: flex;
		gap: 6px;
		flex: 1;
	}
	.progress-dot {
		width: 100%;
		max-width: 48px;
		height: 6px;
		border-radius: 3px;
		border: none;
		background: var(--surface-3);
		cursor: pointer;
		padding: 0;
		transition: background 0.15s;
	}
	.progress-dot:hover {
		background: #4a4a6c;
	}
	.progress-dot.active {
		background: var(--accent);
	}
	.progress-dot.done {
		background: #2d6a4f;
	}
	.progress-dot.done.active {
		background: #40916c;
	}
	.complete-btn {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: 12px;
		padding: 4px 12px;
		border-radius: 5px;
		cursor: pointer;
		white-space: nowrap;
	}
	.complete-btn:hover {
		border-color: var(--accent);
		color: var(--text-primary);
	}
	.app-main {
		display: grid;
		grid-template-columns: minmax(340px, 420px) 1fr;
		flex: 1;
		min-height: 0;
	}
	.lesson-col {
		border-right: 1px solid var(--border);
		background: var(--surface-1);
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.playground-col {
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		background: #0d0d1a;
	}
	.app-footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 20px;
		font-size: 11px;
		color: var(--text-secondary);
		background: var(--surface-1);
		border-top: 1px solid var(--border);
		flex-shrink: 0;
		opacity: 0.7;
	}

	@media (max-width: 900px) {
		.app {
			height: auto;
		}
		.app-main {
			grid-template-columns: 1fr;
		}
		.lesson-col {
			border-right: none;
			border-bottom: 1px solid var(--border);
			max-height: none;
		}
		.playground-col {
			min-height: 700px;
		}
		.app-footer {
			flex-direction: column;
			gap: 2px;
		}
	}
</style>
