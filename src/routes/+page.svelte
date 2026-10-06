<script>
	import { lessonList, modules, phases } from '#lib/content/pixel-editor/lessons.js';
	import { createProgressStore } from '#lib/stores/progress.svelte.js';

	const progress = createProgressStore();

	const currentLesson = $derived(progress.currentLesson ?? 1);
	const currentEntry = $derived(
		lessonList.find((entry) => entry.id === currentLesson) ?? lessonList[0]
	);
	const currentModule = $derived(
		modules.find((entry) => currentLesson >= entry.from && currentLesson <= entry.to) ?? modules[0]
	);

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function lessonsOf(module) {
		return lessonList.filter((entry) => entry.id >= module.from && entry.id <= module.to);
	}

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function completedOf(module) {
		return lessonsOf(module).filter((entry) => progress.isCompleted(entry.id)).length;
	}

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function percentOf(module) {
		const total = lessonsOf(module).length;
		return total === 0 ? 0 : Math.round((completedOf(module) / total) * 100);
	}

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function challengesOf(module) {
		return lessonsOf(module).filter((entry) => entry.type === 'challenge').length;
	}

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function resumeHref(module) {
		const target =
			currentLesson >= module.from && currentLesson <= module.to ? currentLesson : module.from;
		return `/lesson/${target}`;
	}

	/**
	 * @param {(typeof modules)[number]} module
	 */
	function phasesOf(module) {
		return phases.filter((phase) => phase.from >= module.from && phase.to <= module.to);
	}
</script>

<svelte:head>
	<title>Frontend Data Structures Lab</title>
</svelte:head>

<div class="min-h-screen bg-bg text-ink">
	<header class="border-b border-line bg-surface-1 px-6 py-12">
		<div class="mx-auto flex max-w-5xl flex-col gap-4">
			<p class="m-0 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
				Continuous project course
			</p>
			<h1 class="m-0 text-3xl leading-tight font-bold tracking-[-0.02em]">
				Frontend Data Structures Lab
			</h1>
			<p class="m-0 max-w-2xl text-sm leading-relaxed text-muted">
				Two projects, one continuous thread: build the feature first, then hit its limit, then
				choose the data structure the problem is asking for. Every module ends by verifying what was
				built — tests, measurements, resource audit and documented trade-offs.
			</p>
			<div class="mt-1 flex flex-wrap items-center gap-3">
				<a
					href="/lesson/{currentLesson}"
					class="rounded-md border border-accent bg-accent/15 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
				>
					Continue: lesson {currentLesson} · {currentEntry.title}
				</a>
				<span class="text-xs text-muted">Next up in {currentModule.project}</span>
			</div>
		</div>
	</header>

	<main class="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8">
		<h2 class="m-0 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">Modules</h2>

		<div class="grid gap-5 lg:grid-cols-2">
			{#each modules as module (module.id)}
				<article class="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-5">
					<header class="flex flex-col gap-1">
						<h3 class="m-0 text-lg font-bold">{module.label}</h3>
						<p class="m-0 text-xs text-accent">Project: {module.project}</p>
						{#if challengesOf(module) > 0}
							<p class="m-0 text-[11px] text-[#ffd166]">
								⚔ {challengesOf(module) === 1
									? '1 reto integrador'
									: challengesOf(module) + ' retos integradores'}
							</p>
						{/if}
					</header>

					<p class="m-0 text-sm leading-relaxed text-muted">{module.description}</p>

					<ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">
						{#each module.stack as tool (tool)}
							<li
								class="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] text-muted"
							>
								{tool}
							</li>
						{/each}
					</ul>

					<ul class="m-0 flex list-none flex-col gap-1 p-0">
						{#each phasesOf(module) as phase (phase.id)}
							<li class="flex items-start gap-2 text-xs text-muted">
								<span class="text-accent">▸</span>
								<span>{phase.label}</span>
							</li>
						{/each}
					</ul>

					<div class="mt-auto flex flex-col gap-2">
						<div class="flex items-center justify-between text-xs text-muted">
							<span>{completedOf(module)} of {lessonsOf(module).length} lessons complete</span>
							<span class="tabular-nums">{percentOf(module)}%</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-[3px] bg-surface-3">
							<div class="h-full bg-accent" style="width: {percentOf(module)}%"></div>
						</div>
						<a
							href={resumeHref(module)}
							class="mt-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-center text-sm font-semibold text-ink hover:border-accent"
						>
							{completedOf(module) > 0 ? 'Continue module →' : 'Start module →'}
						</a>
					</div>
				</article>
			{/each}
		</div>

		<p class="m-0 mt-2 text-xs leading-relaxed text-muted">
			Each module is a project: a new stack, new data structures and the same closing checklist.
			Lessons are linked, so you can bookmark or share any of them.
		</p>
	</main>

	<footer class="border-t border-line px-6 py-6 text-center text-[11px] text-muted opacity-80">
		Vanilla JS + Canvas + DOM · SvelteKit shell · Progress saved in localStorage
	</footer>
</div>
