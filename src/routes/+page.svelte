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

	/** A returning learner sees "continue"; a first-time visitor sees "start". */
	const started = $derived(currentLesson > 1 || progress.completedLessons.length > 0);
	const completedTotal = $derived(progress.completedLessons.length);
	const progressPercent = $derived(Math.round((completedTotal / lessonList.length) * 100));
	const callToAction = $derived(started ? `Continue: Lesson ${currentLesson}` : 'Start Lesson 1');

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

	/** Tech badges rotate through the three neon accents. */
	const BADGE_STYLES = [
		'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10',
		'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10',
		'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/10'
	];

	/** @param {number} index */
	function badgeClass(index) {
		return (
			'border px-2 py-1 text-[11px] tracking-wider uppercase ' +
			BADGE_STYLES[index % BADGE_STYLES.length]
		);
	}

	/* Repeated class strings, written in full so Tailwind can see them while scanning. */
	const SECTION = 'relative mx-auto w-full max-w-5xl px-6 py-14';
	const EYEBROW = 'm-0 text-[11px] tracking-[0.3em] text-cyber-cyan uppercase';
	const H2 = 'm-0 mt-2 text-2xl font-black tracking-tight text-white uppercase sm:text-3xl';
	const LEAD = 'm-0 mt-3 max-w-3xl text-sm leading-relaxed text-gray-400';
	const PRIMARY_BUTTON =
		'clip-button inline-flex items-center gap-2 bg-cyber-yellow px-7 py-3 text-sm font-bold tracking-wider text-cyber-bg uppercase transition-all duration-300 hover:bg-cyber-cyan hover:shadow-neon-cyan';
	const SECONDARY_BUTTON =
		'clip-button inline-flex items-center gap-2 border-2 border-cyber-magenta bg-transparent px-7 py-3 text-sm font-bold tracking-wider text-cyber-magenta uppercase transition-all duration-300 hover:bg-cyber-magenta hover:text-white hover:shadow-neon-magenta';
	const OUTLINE_BUTTON =
		'clip-button inline-flex items-center justify-center border border-cyber-cyan bg-transparent px-4 py-3 text-sm font-bold tracking-wider text-cyber-cyan uppercase transition-all duration-300 hover:bg-cyber-cyan hover:text-black hover:shadow-neon-cyan';

	/*
	 * Landing-page copy: mirrors the curriculum document (Frontend Engineering
	 * Lab — Curriculum 4). It is presentation text, not app data — module and
	 * lesson facts always come from lessons.js.
	 */
	const PLAN = [
		{ id: '1', focus: 'JavaScript, DOM & Canvas', duration: '3 weeks', state: 'open' },
		{ id: '2', focus: 'Tooling Bridge (Vite, TS, testing)', duration: '1 week', state: 'soon' },
		{ id: '3', focus: 'Flowchart Builder', duration: '4–5 weeks', state: 'soon' },
		{ id: '4', focus: 'Block Editor', duration: '4 weeks', state: 'soon' }
	];

	const UPCOMING = [
		{
			label: 'Future — Block Editor',
			project: 'Block Editor',
			stack: ['React', 'TypeScript', 'Trees', 'CI/PRs']
		},
		{
			label: 'Future — Mini-Jira',
			project: 'Mini-Jira',
			stack: ['Next.js', 'TypeScript', 'Fullstack', 'CD/E2E']
		}
	];

	const LOCKED_MODULES = [
		{
			id: 'm2',
			label: 'Module 2 — Flowchart & Diagram Builder',
			project: 'Diagram Builder',
			pitch:
				'A full professional build with Vite, TypeScript and Vitest. Build a node-based editor with a spatial hash grid for performance and union-find for connectivity.',
			description:
				'Modelling, lookup vs. spatial indexing, graphs, Vitest + ESLint, accessibility, memory.',
			stack: ['Vite', 'TypeScript', 'Canvas 2D', 'Vitest'],
			phases: [
				{ id: 'p1', label: 'Phase 1 — Model, Access & Scale' },
				{ id: 'p2', label: 'Phase 2 — Accessibility & Memory' },
				{ id: 'p3', label: 'Phase 3 — Closing' }
			],
			lessonsCount: 9,
			challengesCount: 1
		}
	];

	const PAIN_CYCLE = [
		{
			step: '01',
			title: 'Build the real feature',
			body: 'You build the working version first. It is simple, it is readable, and it does the job.'
		},
		{
			step: '02',
			title: 'Measure where it breaks',
			body: 'You open the developer tools, push the app to its limit and watch the timings. The problem stops being theory: you saw it freeze.'
		},
		{
			step: '03',
			title: 'Fix it and document the gain',
			body: 'You rewrite it with the right structure and record the before/after numbers. That record is what you show in an interview.'
		}
	];

	const DELIVERABLES = [
		{
			title: 'A public URL',
			body: 'Every project ends deployed, so you can send a working link to anyone.'
		},
		{
			title: 'Benchmarks',
			body: 'Screenshots and numbers from your own machine that justify each technical decision.'
		},
		{
			title: 'ADR-style README',
			body: 'Your reasoning written down, the way real teams document architecture.'
		},
		{
			title: 'Accessibility checklist',
			body: 'Keyboard navigation, visible focus and screen-reader labels.'
		},
		{
			title: 'Quality checklist',
			body: 'Tests passing and continuous integration green, at the standard of that module.'
		}
	];

	const FAQ = [
		{
			question: 'I have never written code. Can I really start here?',
			answer:
				'Yes. Lesson 1 assumes nothing: it explains what a value is, what a variable does and why the line you just typed ran. Every later idea arrives only when the project needs it.'
		},
		{
			question: 'Do I need to install anything?',
			answer:
				'Not to start. The editor, the preview and the console all run inside this page, and your work is saved as you type. Later modules walk you through installing a professional local toolchain, step by step.'
		},
		{
			question: 'How much time does it take?',
			answer:
				'It is designed for 15–20 hours a week, part time. You set the pace — nothing expires and nothing locks.'
		},
		{
			question: 'Where does my progress live?',
			answer:
				'In this browser, on this device. There is no account and nothing is sent anywhere; the course makes no network requests at all.'
		},
		{
			question: 'What do I end up with?',
			answer:
				'A solid JavaScript foundation plus portfolio projects, each deployed on a public URL and documented with benchmarks, an ADR-style README and an accessibility checklist.'
		}
	];
</script>

<svelte:head>
	<title>Frontend Engineering Lab — learn frontend from zero</title>
	<meta
		name="description"
		content="A part-time, browser-based frontend course: build one foundations lab and three deployed portfolio projects, with benchmarks, tests and documentation."
	/>
</svelte:head>

<div class="relative min-h-screen bg-cyber-bg text-ink">
	<!-- Background decorations -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute top-1/4 right-0 h-64 w-64 rounded-full bg-cyber-cyan/10 blur-[100px]"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyber-magenta/10 blur-[120px]"
	></div>

	<nav
		class="sticky top-0 z-50 border-b-2 border-cyber-cyan bg-cyber-bg/90 backdrop-blur-sm"
		aria-label="Main"
	>
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
			<span class="text-sm font-bold tracking-widest text-white uppercase">
				Frontend Engineering Lab
			</span>
			<a href="/lesson/{currentLesson}" class="clip-button {PRIMARY_BUTTON}">▶ {callToAction}</a>
		</div>
	</nav>

	<header class="relative px-6 pt-14 pb-10">
		<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
			<p class={EYEBROW}>&gt; root@localhost:~$ ./frontend-lab --init</p>
			<div class="glitch-wrapper">
				<h1
					class="glitch m-0 text-3xl leading-none font-black tracking-tighter text-white uppercase sm:text-5xl md:text-6xl"
					data-text="Frontend Engineering Lab"
				>
					Frontend Engineering Lab
				</h1>
			</div>
			<p class="m-0 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
				Learn web development by building real projects you can show — starting from zero.
			</p>
			<p class="m-0 max-w-2xl text-sm leading-relaxed text-gray-400">
				No previous experience required: the course explains every word the first time it appears.
				You write your first line of code in lesson 1 and finish with three projects live on the
				internet, each one documented with measurements, tests and design notes.
			</p>

			<div class="mt-1 flex flex-wrap items-center gap-3">
				<a href="/lesson/{currentLesson}" class="clip-button {PRIMARY_BUTTON}">
					▶ {callToAction}
				</a>
				<a href="#projects" class="clip-button {SECONDARY_BUTTON}">What you'll build ↓</a>
			</div>

			{#if started}
				<div class="mt-2 flex max-w-xl flex-col gap-2">
					<div
						class="flex items-center justify-between text-[11px] tracking-widest text-gray-500 uppercase"
					>
						<span>Your progress · {completedTotal}/{lessonList.length} lessons</span>
						<span class="text-cyber-cyan tabular-nums">{progressPercent}%</span>
					</div>
					<div class="h-1 w-full bg-gray-800">
						<div
							class="h-full bg-cyber-cyan shadow-neon-cyan"
							style="width: {progressPercent}%"
						></div>
					</div>
					<p class="m-0 text-xs text-gray-500">
						Next up: {currentModule.project} // {currentEntry.title}
					</p>
				</div>
			{/if}

			<ul
				class="mt-3 grid list-none grid-cols-2 gap-x-6 gap-y-3 p-0 text-[11px] tracking-widest text-gray-400 uppercase sm:grid-cols-4"
			>
				<li class="border-l-2 border-l-cyber-yellow pl-3">
					<span class="block text-lg text-cyber-yellow">1 + 3</span>
					Foundations lab + portfolio projects
				</li>
				<li class="border-l-2 border-l-cyber-cyan pl-3">
					<span class="block text-lg text-cyber-cyan">15–20 h</span>
					Per week, part time
				</li>
				<li class="border-l-2 border-l-cyber-magenta pl-3">
					<span class="block text-lg text-cyber-magenta">0</span>
					Installs needed to start
				</li>
				<li class="border-l-2 border-l-cyber-cyan pl-3">
					<span class="block text-lg text-cyber-cyan">100%</span>
					Runs in your browser
				</li>
			</ul>
		</div>
	</header>

	<main>
		<!-- What you'll build -->
		<section id="projects" class={SECTION}>
			<p class={EYEBROW}>&gt; projects --list</p>
			<h2 class={H2}>What you'll build</h2>
			<p class={LEAD}>
				Every project is a real app, not a toy exercise. You build it right here in the browser, and
				it ends up deployed and documented. And if you want the technical summary behind a project,
				every card has a "technical detail" section you can open.
			</p>

			<div class="mt-8 grid gap-6 lg:grid-cols-2">
				{#each modules as module, index (module.id)}
					<article
						class="clip-card group relative border border-gray-800 bg-cyber-surface transition-colors duration-300 hover:border-cyber-cyan"
					>
						<div
							class="flex items-center justify-between border-b border-gray-800 bg-black/50 px-4 py-2 text-[11px] tracking-widest text-gray-500 uppercase"
						>
							<span>SYS.DAT // 0X0{index + 1}</span>
							<span class="text-cyber-cyan">
								STATUS: {completedOf(module) > 0 ? 'IN PROGRESS' : 'READY'}
							</span>
						</div>

						<div class="flex flex-col gap-4 p-6">
							<div class="flex flex-col gap-1">
								<h3
									class="m-0 text-xl font-bold tracking-wide text-white uppercase transition-colors group-hover:text-cyber-cyan"
								>
									{module.label}
								</h3>
								<p class="m-0 text-xs tracking-widest text-cyber-yellow uppercase">
									PROJECT: {module.project}
								</p>
								{#if challengesOf(module) > 0}
									<p class="m-0 text-[11px] tracking-widest text-cyber-magenta uppercase">
										⚔ {challengesOf(module)} challenge{challengesOf(module) === 1 ? '' : 's'}
									</p>
								{/if}
							</div>

							<p class="m-0 text-sm leading-relaxed text-gray-300">{module.pitch}</p>

							<details class="border-t border-gray-800 pt-3">
								<summary
									class="cursor-pointer list-none text-[11px] tracking-widest text-gray-500 uppercase hover:text-cyber-cyan [&::-webkit-details-marker]:hidden"
								>
									▸ Technical detail
								</summary>
								<p class="mt-2 mb-0 text-xs leading-relaxed text-gray-500">
									{module.description}
								</p>
							</details>

							<ul class="m-0 flex list-none flex-wrap gap-2 p-0">
								{#each module.stack as tool, toolIndex (tool)}
									<li class={badgeClass(toolIndex)}>{tool}</li>
								{/each}
							</ul>

							<ul class="m-0 flex list-none flex-col gap-1 p-0">
								{#each phasesOf(module) as phase (phase.id)}
									<li class="flex items-start gap-2 text-xs text-gray-500">
										<span class="text-cyber-cyan">&gt;</span>
										<span>{phase.label}</span>
									</li>
								{/each}
							</ul>

							<div class="mt-auto flex flex-col gap-3">
								<div
									class="flex items-center justify-between text-[11px] tracking-widest text-gray-500 uppercase"
								>
									<span>{completedOf(module)}/{lessonsOf(module).length} lessons</span>
									<span class="text-cyber-cyan tabular-nums">{percentOf(module)}%</span>
								</div>
								<div class="h-1 w-full bg-gray-800">
									<div
										class="h-full bg-cyber-cyan shadow-neon-cyan"
										style="width: {percentOf(module)}%"
									></div>
								</div>
								<a href={resumeHref(module)} class={OUTLINE_BUTTON}>
									{completedOf(module) > 0 ? 'Continue module' : 'Start module'}
								</a>
							</div>
						</div>

						<div
							aria-hidden="true"
							class="absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2 border-cyber-cyan opacity-0 transition-opacity group-hover:opacity-100"
						></div>
					</article>
				{/each}

				{#each LOCKED_MODULES as module (module.id)}
					<article
						class="clip-card group relative border border-gray-800 bg-cyber-surface transition-colors duration-300"
					>
						<div
							class="flex items-center justify-between border-b border-gray-800 bg-black/50 px-4 py-2 text-[11px] tracking-widest text-gray-500 uppercase"
						>
							<span>SYS.DAT // 0X02</span>
							<span class="text-gray-500"> STATUS: LOCKED </span>
						</div>

						<div class="flex flex-col gap-4 p-6 opacity-75">
							<div class="flex flex-col gap-1">
								<h3
									class="m-0 text-xl font-bold tracking-wide text-gray-400 uppercase transition-colors"
								>
									{module.label}
								</h3>
								<p class="m-0 text-xs tracking-widest text-gray-500 uppercase">
									PROJECT: {module.project}
								</p>
								{#if module.challengesCount > 0}
									<p class="m-0 text-[11px] tracking-widest text-gray-500 uppercase">
										⚔ {module.challengesCount} challenge{module.challengesCount === 1 ? '' : 's'}
									</p>
								{/if}
							</div>

							<p class="m-0 text-sm leading-relaxed text-gray-400">{module.pitch}</p>

							<details class="border-t border-gray-800 pt-3">
								<summary
									class="cursor-pointer list-none text-[11px] tracking-widest text-gray-500 uppercase hover:text-gray-400 [&::-webkit-details-marker]:hidden"
								>
									▸ Technical detail
								</summary>
								<p class="mt-2 mb-0 text-xs leading-relaxed text-gray-500">
									{module.description}
								</p>
							</details>

							<ul class="m-0 flex list-none flex-wrap gap-2 p-0">
								{#each module.stack as tool (tool)}
									<li
										class="border border-gray-700 px-2 py-1 text-[11px] tracking-wider text-gray-500 uppercase"
									>
										{tool}
									</li>
								{/each}
							</ul>

							<ul class="m-0 flex list-none flex-col gap-1 p-0">
								{#each module.phases as phase (phase.id)}
									<li class="flex items-start gap-2 text-xs text-gray-500">
										<span class="text-gray-600">&gt;</span>
										<span>{phase.label}</span>
									</li>
								{/each}
							</ul>

							<div class="mt-auto flex flex-col gap-3">
								<div
									class="flex items-center justify-between text-[11px] tracking-widest text-gray-500 uppercase"
								>
									<span>0/{module.lessonsCount} lessons</span>
									<span class="text-gray-500 tabular-nums">0%</span>
								</div>
								<div class="h-1 w-full bg-gray-800">
									<div class="h-full bg-gray-600 shadow-none" style="width: 0%"></div>
								</div>
								<button
									disabled
									class="clip-button inline-flex cursor-not-allowed items-center justify-center border border-gray-700 bg-transparent px-4 py-3 text-sm font-bold tracking-wider text-gray-500 uppercase"
								>
									Locked (Complete Module 1)
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>

			<div class="mt-8 flex flex-col gap-3">
				<p class="m-0 text-[11px] tracking-[0.3em] text-cyber-magenta uppercase">
					&gt; modules --upcoming
				</p>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each UPCOMING as upcoming (upcoming.project)}
						<article class="clip-card border border-dashed border-gray-800 bg-black/40 p-5">
							<div class="flex items-center justify-between gap-3">
								<h3 class="m-0 text-sm font-bold tracking-wide text-gray-300 uppercase">
									{upcoming.label}
								</h3>
								<span
									class="clip-button border border-cyber-magenta px-2 py-0.5 text-[10px] tracking-widest text-cyber-magenta uppercase"
								>
									Coming next
								</span>
							</div>
							<p class="mt-3 mb-0 text-xs leading-relaxed text-gray-500">
								The same format on a bigger stack: {upcoming.project}, with new data structures,
								code review and continuous delivery. The lessons open as each module ships.
							</p>
							<ul class="mt-3 mb-0 flex list-none flex-wrap gap-2 p-0">
								{#each upcoming.stack as tool (tool)}
									<li
										class="border border-gray-800 px-2 py-1 text-[11px] tracking-wider text-gray-500 uppercase"
									>
										{tool}
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- How the course works -->
		<section class="relative border-y border-gray-800 bg-black/40">
			<div class={SECTION}>
				<p class={EYEBROW}>&gt; how --it-works</p>
				<h2 class={H2}>Why you'll actually remember it</h2>
				<p class={LEAD}>
					Nothing enters this course because it is fashionable. Every tool and every idea has to
					survive the same three-step test — and you run the test yourself, on your own project.
				</p>

				<div class="mt-8 grid gap-5 md:grid-cols-3">
					{#each PAIN_CYCLE as phase (phase.step)}
						<article class="clip-card border border-gray-800 bg-cyber-surface p-6">
							<span class="text-3xl font-black text-cyber-yellow">{phase.step}</span>
							<h3 class="mt-2 mb-2 text-base font-bold tracking-wide text-white uppercase">
								{phase.title}
							</h3>
							<p class="m-0 text-sm leading-relaxed text-gray-400">{phase.body}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- Definition of done -->
		<section class={SECTION}>
			<p class={EYEBROW}>&gt; definition-of-done --show</p>
			<h2 class={H2}>Every project ships like a real one</h2>
			<p class={LEAD}>
				A finished course project is not "it works on my machine". Each one closes with the same
				checklist, and the standard rises as you go.
			</p>

			<ul class="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
				{#each DELIVERABLES as item, index (item.title)}
					<li class="clip-card border border-gray-800 bg-cyber-surface p-5">
						<span class="text-[11px] tracking-widest text-cyber-cyan tabular-nums">
							{String(index + 1).padStart(2, '0')}
						</span>
						<h3 class="mt-1 mb-2 text-sm font-bold tracking-wide text-white uppercase">
							{item.title}
						</h3>
						<p class="m-0 text-xs leading-relaxed text-gray-400">{item.body}</p>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Interview practice -->
		<section class="relative border-y border-gray-800 bg-black/40">
			<div class={SECTION}>
				<p class="m-0 text-[11px] tracking-[0.3em] text-cyber-magenta uppercase">
					&gt; interview --prepare
				</p>
				<h2 class={H2}>Practice for the technical interview</h2>
				<p class={LEAD}>
					Each module closes with one challenge that is 80% the code you already built and 20% new
					reasoning. Solve it in the playground and the lesson then shows you the equivalent
					interview question from LeetCode — optional, and always after you have solved it yourself.
				</p>
				<div class="mt-8 grid gap-5 md:grid-cols-2">
					<article class="clip-card border border-cyber-magenta/60 bg-cyber-magenta/5 p-6">
						<h3 class="mt-0 mb-2 text-sm font-bold tracking-wide text-cyber-magenta uppercase">
							The boss fight
						</h3>
						<p class="m-0 text-sm leading-relaxed text-gray-300">
							Nobody sends you to a puzzle site on day one. You solve the problem inside the project
							you have been building, with a checker that grades your result and tells you exactly
							which cases fail.
						</p>
					</article>
					<article class="clip-card border border-gray-800 bg-cyber-surface p-6">
						<h3 class="mt-0 mb-2 text-sm font-bold tracking-wide text-cyber-cyan uppercase">
							Then the interview version
						</h3>
						<p class="m-0 text-sm leading-relaxed text-gray-400">
							Once your solution passes, the lesson connects the pattern to its interview equivalent
							— so the algorithm you wrote for a drawing tool is the same idea you can explain, with
							confidence, in a hiring loop.
						</p>
					</article>
				</div>
			</div>
		</section>

		<!-- Curriculum map -->
		<section class={SECTION}>
			<p class={EYEBROW}>&gt; curriculum --map</p>
			<h2 class={H2}>How the path is laid out</h2>
			<p class={LEAD}>
				Part time, one project at a time. The first blocks build the same drawing app — first the
				simple version, then the fast one, then the professional setup — so nothing arrives before
				you have felt the need for it.
			</p>

			<ul class="mt-8 grid list-none gap-3 p-0">
				{#each PLAN as block (block.id)}
					<li
						class="clip-card flex flex-wrap items-center gap-x-4 gap-y-1 border border-gray-800 bg-cyber-surface px-5 py-4"
					>
						<span class="text-lg font-black text-cyber-yellow tabular-nums">{block.id}</span>
						<span class="flex-1 text-sm text-gray-300">{block.focus}</span>
						<span class="text-[11px] tracking-widest text-gray-500 uppercase">
							{block.duration}
						</span>
						<span
							class="clip-button border px-2 py-0.5 text-[10px] tracking-widest uppercase {block.state ===
							'open'
								? 'border-cyber-cyan text-cyber-cyan'
								: 'border-gray-700 text-gray-500'}"
						>
							{block.state === 'open' ? 'Available' : 'Coming next'}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- FAQ -->
		<section class={SECTION}>
			<p class={EYEBROW}>&gt; faq --read</p>
			<h2 class={H2}>Questions before you start</h2>

			<div class="mt-8 flex flex-col gap-3">
				{#each FAQ as item, index (item.question)}
					<details
						open={index === 0}
						class="clip-card border border-gray-800 bg-cyber-surface px-5 py-4"
					>
						<summary
							class="cursor-pointer list-none text-sm font-bold tracking-wide text-gray-200 uppercase hover:text-cyber-cyan [&::-webkit-details-marker]:hidden"
						>
							<span class="mr-2 text-cyber-yellow">?</span>{item.question}
						</summary>
						<p class="mt-3 mb-0 text-sm leading-relaxed text-gray-400">{item.answer}</p>
					</details>
				{/each}
			</div>
		</section>

		<!-- Final call to action -->
		<section class={SECTION}>
			<div class="clip-card border border-cyber-cyan bg-cyber-surface p-7 shadow-neon-cyan">
				<p class="m-0 text-sm text-cyber-cyan">&gt; root@localhost:~$ ./lesson-01 --open</p>
				<h2 class="mt-3 mb-3 text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
					Your first pixel is one click away
				</h2>
				<p class="m-0 mb-6 max-w-2xl text-sm leading-relaxed text-gray-400">
					Lesson 1 needs no setup and no prior knowledge. If something breaks, the console under the
					preview shows what the browser saw, and every lesson repeats the idea behind it in plain
					words.
				</p>
				<div class="flex flex-wrap items-center gap-3">
					<a href="/lesson/{currentLesson}" class="clip-button {PRIMARY_BUTTON}">
						▶ {callToAction}
					</a>
					<span class="text-xs tracking-widest text-gray-500 uppercase">
						{currentModule.project} // {currentEntry.title}
					</span>
				</div>
			</div>
		</section>
	</main>

	<footer class="relative border-t border-gray-800 px-6 pt-14 pb-10">
		<div
			class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyber-cyan bg-black px-4 py-1 text-[11px] tracking-widest text-cyber-cyan uppercase"
		>
			End of transmission
		</div>
		<div class="clip-card mx-auto max-w-5xl border border-gray-800 bg-cyber-surface p-6">
			<p class="m-0 mb-3 text-sm text-cyber-cyan">&gt; root@localhost:~$ cat curriculum.md</p>
			<p class="m-0 text-xs leading-relaxed text-gray-400">
				One foundations lab, three portfolio projects and a closing checklist that grows with you:
				public deployment, benchmarks, an ADR-style README, accessibility and quality checks.
				Everything runs in the browser, progress is saved in localStorage, and nothing leaves your
				machine.
			</p>
		</div>
	</footer>
</div>
