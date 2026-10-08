<script>
	import { goto } from '$app/navigation';
	import LessonPanel from '#lib/components/LessonPanel.svelte';
	import Playground from '#lib/components/Playground.svelte';
	import {
		getModule,
		getPhaseLabel,
		lessonList,
		loadLesson,
		modules
	} from '#lib/content/pixel-editor/lessons.js';
	import { createProgressStore } from '#lib/stores/progress.svelte.js';

	/** @type {{ data: { id: number } }} */
	let { data } = $props();

	const progress = createProgressStore();
	const currentId = $derived(data.id);

	/** Collapses the lesson panel to a strip so editor + preview get the width. */
	let focus = $state(false);

	/** Loaded lessons, keyed by id, so switching back is instant. */
	/** @type {Map<number, any>} */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain memo cache, never read in markup
	const lessonCache = new Map();
	/** @type {any} */
	let lesson = $state(null);
	let lessonError = $state(false);

	/** Where the user left each module, so switching back feels natural. */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain lookup table
	const lastVisitedByModule = new Map();

	const currentModule = $derived(getModule(currentId) ?? modules[0]);
	const moduleLessons = $derived(
		lessonList.filter((entry) => entry.id >= currentModule.from && entry.id <= currentModule.to)
	);
	const position = $derived(moduleLessons.findIndex((entry) => entry.id === currentId) + 1);
	const phaseLabel = $derived(getPhaseLabel(currentId));

	let savedCode = $derived(progress.getEditorContents(currentId));
	let completed = $derived(progress.isCompleted(currentId));

	// Prose and starter code are separate chunks: load the active lesson on
	// demand instead of shipping the whole curriculum up front.
	$effect(() => {
		const id = currentId;
		lessonError = false;

		const cached = lessonCache.get(id);
		if (cached) {
			lesson = cached;
			return;
		}

		let cancelled = false;
		loadLesson(id)
			.then((loaded) => {
				lessonCache.set(id, loaded);
				if (!cancelled) lesson = loaded;
			})
			.catch(() => {
				if (!cancelled) lessonError = true;
			});

		return () => {
			cancelled = true;
		};
	});

	/** @param {number} id */
	function goToLesson(id) {
		if (id >= 1 && id <= lessonList.length) goto(`/lesson/${id}`);
	}

	function goPrevious() {
		if (position > 1) goToLesson(moduleLessons[position - 2].id);
	}

	function goNext() {
		if (position < moduleLessons.length) goToLesson(moduleLessons[position].id);
	}

	/** @param {(typeof modules)[number]} target */
	function goToModule(target) {
		goToLesson(lastVisitedByModule.get(target.id) ?? target.from);
	}

	/** @param {string} id */
	function goToModuleById(id) {
		const target = modules.find((entry) => entry.id === id);
		if (target) goToModule(target);
	}

	function handleSave(lessonId, code) {
		progress.saveEditorContents(lessonId, code);
	}

	function toggleComplete() {
		progress.toggleCompleted(currentId);
	}

	/** Progress dots: completed, active and completed+active each have a colour. */
	/** @param {number} id */
	function dotClass(id) {
		const done = progress.isCompleted(id);
		const active = id === currentId;
		if (done && active) return 'bg-cyber-yellow shadow-neon-yellow';
		if (done) return 'bg-cyber-cyan';
		if (active) return 'bg-cyber-yellow shadow-neon-yellow';
		if (isChallenge(id)) return 'bg-cyber-magenta hover:bg-cyber-magenta/70';
		return 'bg-surface-3 hover:bg-cyber-cyan/40';
	}

	/** @param {number} id */
	function isChallenge(id) {
		return lessonList.find((entry) => entry.id === id)?.type === 'challenge';
	}

	/** @param {{ id: number, title: string, type?: string }} entry */
	function dotTitle(entry, index) {
		return index + 1 + '. ' + entry.title + (entry.type === 'challenge' ? ' · boss fight' : '');
	}

	/** @param {{ id: number, title: string, type?: string }} entry */
	function dotLabel(entry, index) {
		return (
			'Go to lesson ' +
			(index + 1) +
			' of ' +
			moduleLessons.length +
			': ' +
			entry.title +
			(entry.type === 'challenge' ? ' (challenge)' : '')
		);
	}

	// Persist the current lesson and remember it per module.
	let lastPersistedId = 0;
	$effect(() => {
		if (currentId !== lastPersistedId) {
			lastPersistedId = currentId;
			progress.currentLesson = currentId;
		}

		const owner = getModule(currentId);
		if (owner) lastVisitedByModule.set(owner.id, currentId);
	});

	const HEADER_BUTTON =
		'clip-button cursor-pointer border border-cyber-cyan bg-transparent px-2.5 py-1 text-[11px] tracking-wider whitespace-nowrap text-cyber-cyan uppercase transition-all duration-300 hover:bg-cyber-cyan hover:text-black hover:shadow-neon-cyan';
	const STEP_BUTTON =
		'cursor-pointer border border-gray-800 bg-black/40 px-3 py-1.5 text-[17px] leading-none text-gray-400 transition-colors hover:border-cyber-cyan hover:text-cyber-cyan disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400';
	const COMPLETE_BUTTON =
		'clip-button w-full cursor-pointer border px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-300';
</script>

<svelte:head>
	<title>{currentModule.project} — Lesson {position} · {currentModule.label}</title>
</svelte:head>

<div class="lab-viewport flex flex-col overflow-hidden bg-cyber-bg">
	<!-- One row: identity, module picker, position and navigation. -->
	<header
		class="flex flex-shrink-0 items-center gap-2 border-b-2 border-cyber-cyan bg-cyber-bg/90 px-2 py-1 shadow-neon-cyan backdrop-blur-sm"
	>
		<a href="/" class={HEADER_BUTTON} title="Back to the module list">← Modules</a>

		<label class="sr-only" for="module-select">Module</label>
		<select
			id="module-select"
			class="max-w-[220px] cursor-pointer border border-cyber-cyan bg-black px-2 py-1 text-[11px] tracking-wider text-cyber-cyan uppercase"
			value={currentModule.id}
			onchange={(event) => goToModuleById(event.currentTarget.value)}
		>
			{#each modules as entry (entry.id)}
				<option value={entry.id}>{entry.short}</option>
			{/each}
		</select>

		<div class="flex min-w-0 items-baseline gap-2">
			<h1 class="truncate text-[12px] font-bold tracking-wide text-white uppercase">
				{currentModule.label}
			</h1>
			<span
				class="hidden truncate text-[10px] tracking-widest text-cyber-yellow uppercase lg:inline"
			>
				{currentModule.project}
			</span>
		</div>

		<div class="ml-auto flex flex-shrink-0 items-center gap-1.5">
			<span class="text-[14px] tracking-widest whitespace-nowrap text-gray-400 uppercase">
				Lesson <b class="text-cyber-yellow tabular-nums">{position}</b>
				<span class="opacity-40">/</span>
				<span class="tabular-nums">{moduleLessons.length}</span>
			</span>
			<button
				class={STEP_BUTTON}
				onclick={goPrevious}
				disabled={position <= 1}
				aria-label="Previous lesson"
			>
				‹
			</button>
			<button
				class={STEP_BUTTON}
				onclick={goNext}
				disabled={position >= moduleLessons.length}
				aria-label="Next lesson"
			>
				›
			</button>
			<button
				class={STEP_BUTTON}
				class:border-cyber-yellow={focus}
				class:text-cyber-yellow={focus}
				onclick={() => (focus = !focus)}
				aria-pressed={focus}
				aria-label={focus ? 'Expand the lesson panel' : 'Collapse the lesson panel to a strip'}
				title="Focus mode: give the width to the editor and preview"
			>
				⛶
			</button>
		</div>
	</header>

	<!-- Phase + lesson strip: the labelled row that switches lessons. -->
	<div
		class="lab-strip-glow flex flex-shrink-0 flex-col gap-2 border-b border-gray-800 bg-cyber-surface px-5 py-2"
	>
		<div class="flex justify-center">
			<span class="text-[11px] tracking-[0.25em] text-cyber-cyan uppercase opacity-90">
				{phaseLabel}
			</span>
		</div>
		<div class="flex flex-1 gap-1.5" role="group" aria-label="Lesson progress">
			{#each moduleLessons as entry, index (entry.id)}
				<button
					class="h-1.5 w-full max-w-12 cursor-pointer border-none p-0 transition-all duration-300 {dotClass(
						entry.id
					)}"
					onclick={() => goToLesson(entry.id)}
					title={dotTitle(entry, index)}
					aria-label={dotLabel(entry, index)}
					aria-current={entry.id === currentId ? 'true' : undefined}
				></button>
			{/each}
		</div>
	</div>

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
		{#if lesson && lesson.id === currentId}
			{#key lesson.id}
				<Playground
					bind:focus
					lessonId={lesson.id}
					starterCode={lesson.starterCode}
					{savedCode}
					onsave={handleSave}
				>
					{#snippet lessonColumn()}
						<div class="min-h-0 flex-1 overflow-hidden">
							<LessonPanel {lesson} />
						</div>
						<div
							class="flex flex-shrink-0 items-center gap-2 border-t border-gray-800 bg-cyber-surface px-3 py-2"
						>
							<button
								class="{COMPLETE_BUTTON} {completed
									? 'border-cyber-cyan bg-cyber-cyan text-black hover:shadow-neon-cyan'
									: 'border-cyber-cyan bg-transparent text-cyber-cyan hover:bg-cyber-cyan hover:text-black'}"
								onclick={toggleComplete}
								aria-pressed={completed}
							>
								{completed ? '✓ Completed' : 'Mark complete'}
							</button>
						</div>
					{/snippet}
				</Playground>
			{/key}
		{:else}
			<div class="flex h-full items-center justify-center p-10 text-sm text-muted">
				{#if lessonError}
					<p>Could not load lesson {currentId}. Reload the page to try again.</p>
				{:else}
					<p>Loading lesson…</p>
				{/if}
			</div>
		{/if}
	</main>
</div>
