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
		if (done && active) return 'bg-[#40916c]';
		if (done) return 'bg-[#2d6a4f]';
		if (active) return 'bg-accent';
		if (isChallenge(id)) return 'bg-[#9a7b1f] hover:bg-[#b8933a]';
		return 'bg-surface-3 hover:bg-[#4a4a6c]';
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

<div class="flex h-screen min-h-screen flex-col bg-bg max-[900px]:h-auto">
	<header
		class="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-1 px-5 py-3"
	>
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<a
					href="/"
					class="rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted hover:border-accent hover:text-ink"
					title="Back to the module list"
				>
					← Modules
				</a>
				<div>
					<h1 class="m-0 text-[17px] font-bold tracking-[-0.01em]">{currentModule.label}</h1>
					<p class="mt-0.5 mb-0 text-xs text-muted">Project: {currentModule.project}</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-1" role="group" aria-label="Course modules">
				{#each modules as entry (entry.id)}
					<button
						class="cursor-pointer rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors {entry.id ===
						currentModule.id
							? 'border-accent bg-accent/15 text-accent'
							: 'border-line bg-surface-2 text-muted hover:text-ink'}"
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
		class="flex flex-shrink-0 flex-col gap-2 border-b border-line bg-surface-1 px-5 py-2 max-[900px]:gap-1.5"
	>
		<div class="flex justify-center">
			<span class="text-[11px] font-semibold tracking-[0.05em] text-accent uppercase opacity-80">
				{getPhaseLabel(currentId)}
			</span>
		</div>
		<div class="flex flex-1 gap-1.5">
			{#each moduleLessons as entry, index (entry.id)}
				<button
					class="h-1.5 w-full max-w-12 cursor-pointer rounded-[3px] border-none p-0 transition-colors {dotClass(
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
			class="cursor-pointer rounded-[5px] border border-line bg-transparent px-3 py-1 text-xs whitespace-nowrap text-muted hover:border-accent hover:text-ink"
			onclick={toggleComplete}
			aria-pressed={completed}
		>
			{completed ? '✓ Completed' : 'Mark complete'}
		</button>
	</div>

	<main class="grid min-h-0 flex-1 grid-cols-[minmax(340px,420px)_1fr] max-[900px]:grid-cols-1">
		{#if lesson && lesson.id === currentId}
			<section
				class="flex min-h-0 flex-col overflow-hidden border-r border-line bg-surface-1 max-[900px]:border-r-0 max-[900px]:border-b"
			>
				<LessonPanel {lesson} />
			</section>
			<section class="flex min-h-0 min-w-0 flex-col bg-[#0d0d1a] max-[900px]:min-h-[700px]">
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
		class="flex flex-shrink-0 justify-between gap-3 border-t border-line bg-surface-1 px-5 py-1.5 text-[11px] text-muted opacity-70 max-[900px]:flex-col max-[900px]:gap-0.5"
	>
		<span>Vanilla JS + Canvas + DOM in the preview · SvelteKit shell · No backend</span>
		<span>Progress saved in localStorage</span>
	</footer>
</div>
