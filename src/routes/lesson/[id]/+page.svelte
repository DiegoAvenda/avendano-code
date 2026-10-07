<script>
	import { goto } from '$app/navigation';
	import LessonPanel from '#lib/components/LessonPanel.svelte';
	import Playground from '#lib/components/Playground.svelte';
	import LessonNavigation from '#lib/components/LessonNavigation.svelte';
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
		return (
			index + 1 + '. ' + entry.title + (entry.type === 'challenge' ? ' · reto integrador' : '')
		);
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
</script>

<svelte:head>
	<title>{currentModule.project} — Lesson {position} · {currentModule.label}</title>
</svelte:head>

<div class="flex h-screen min-h-screen flex-col bg-cyber-bg max-[900px]:h-auto">
	<header
		class="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 border-b-2 border-cyber-cyan bg-cyber-bg/90 px-5 py-3 shadow-neon-cyan backdrop-blur-sm"
	>
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<a
					href="/"
					class="clip-button border border-cyber-cyan bg-transparent px-3 py-1.5 text-[11px] tracking-wider text-cyber-cyan uppercase transition-all duration-300 hover:bg-cyber-cyan hover:text-black hover:shadow-neon-cyan"
					title="Back to the module list"
				>
					← Modules
				</a>
				<div>
					<h1 class="m-0 text-[17px] font-bold tracking-wide text-white uppercase">
						{currentModule.label}
					</h1>
					<p class="mt-0.5 mb-0 text-[11px] tracking-widest text-cyber-yellow uppercase">
						PROJECT: {currentModule.project}
					</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-1" role="group" aria-label="Course modules">
				{#each modules as entry (entry.id)}
					<button
						class="cursor-pointer border px-2.5 py-1 text-[11px] tracking-wider uppercase transition-all duration-300 {entry.id ===
						currentModule.id
							? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow'
							: 'border-gray-800 bg-black/40 text-gray-500 hover:border-cyber-cyan hover:text-cyber-cyan'}"
						onclick={() => goToModule(entry)}
						aria-pressed={entry.id === currentModule.id}
						title={entry.description}
					>
						{entry.short}
					</button>
				{/each}
			</div>
		</div>
		<div class="min-w-[260px]">
			<LessonNavigation
				{position}
				total={moduleLessons.length}
				onprevious={goPrevious}
				onnext={goNext}
				isCompleted={completed}
			/>
		</div>
	</header>

	<div
		class="flex flex-shrink-0 flex-col gap-2 border-b border-gray-800 bg-cyber-surface px-5 py-2 max-[900px]:gap-1.5"
	>
		<div class="flex justify-center">
			<span class="text-[11px] tracking-[0.25em] text-cyber-cyan uppercase opacity-90">
				{getPhaseLabel(currentId)}
			</span>
		</div>
		<div class="flex flex-1 gap-1.5">
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
		<button
			class="clip-button cursor-pointer border px-3 py-1 text-[11px] tracking-wider whitespace-nowrap uppercase transition-all duration-300 {completed
				? 'border-cyber-cyan bg-cyber-cyan text-black hover:shadow-neon-cyan'
				: 'border-cyber-cyan bg-transparent text-cyber-cyan hover:bg-cyber-cyan hover:text-black'}"
			onclick={toggleComplete}
			aria-pressed={completed}
		>
			{completed ? '✓ Completed' : 'Mark complete'}
		</button>
	</div>

	<main class="grid min-h-0 flex-1 grid-cols-[minmax(340px,420px)_1fr] max-[900px]:grid-cols-1">
		{#if lesson && lesson.id === currentId}
			<section
				class="flex min-h-0 flex-col overflow-hidden border-r border-gray-800 bg-cyber-surface max-[900px]:border-r-0 max-[900px]:border-b"
			>
				<LessonPanel {lesson} />
			</section>
			<section class="flex min-h-0 min-w-0 flex-col bg-black max-[900px]:min-h-[700px]">
				{#key lesson.id}
					<Playground
						lessonId={lesson.id}
						starterCode={lesson.starterCode}
						{savedCode}
						onsave={handleSave}
					/>
				{/key}
			</section>
		{:else}
			<div class="col-span-full flex items-center justify-center p-10 text-sm text-muted">
				{#if lessonError}
					<p>Could not load lesson {currentId}. Reload the page to try again.</p>
				{:else}
					<p>Loading lesson…</p>
				{/if}
			</div>
		{/if}
	</main>

	<footer
		class="flex flex-shrink-0 justify-between gap-3 border-t border-gray-800 bg-black px-5 py-1.5 text-[11px] tracking-wider text-gray-500 uppercase max-[900px]:flex-col max-[900px]:gap-0.5"
	>
		<span>&gt; vanilla JS + Canvas + DOM in the preview · SvelteKit shell</span>
		<span class="text-cyber-cyan">progress :: localStorage</span>
	</footer>
</div>
