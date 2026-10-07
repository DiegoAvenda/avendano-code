<script>
	import { renderMarkdown } from '#lib/markdown.js';

	/**
	 * @type {{ lesson: any }}
	 */
	let { lesson } = $props();

	const SECTION_HEADING =
		'flex items-center gap-2 border-b border-gray-800 bg-black/50 px-3.5 py-2.5 text-[11px] font-bold tracking-widest text-cyber-cyan uppercase';
	const SECTION_CONTENT = 'p-3.5 text-[13px] leading-relaxed text-gray-400';
</script>

<article
	class="h-full [scrollbar-width:thin] [scrollbar-color:var(--color-cyber-yellow)_transparent] overflow-y-auto p-5"
>
	<header class="mb-5 border-b border-gray-800 pb-3">
		<div class="flex flex-wrap items-center gap-2">
			<h2 class="text-[20px] leading-tight font-bold tracking-wide text-white uppercase">
				{lesson.title}
			</h2>
			{#if lesson.type === 'challenge'}
				<span
					class="clip-button border border-cyber-magenta bg-cyber-magenta/10 px-2 py-0.5 text-[11px] tracking-widest text-cyber-magenta uppercase shadow-neon-magenta"
				>
					Integrative challenge
				</span>
			{/if}
		</div>
	</header>

	<section class="flex flex-col gap-5">
		<div class="text-sm leading-relaxed text-gray-400">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
			{@html renderMarkdown(lesson.description)}
		</div>

		<div class="clip-card overflow-hidden border border-gray-800">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">🎯</span>
				Task
			</h3>
			<div class={SECTION_CONTENT}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.task)}
			</div>
		</div>

		<div class="clip-card overflow-hidden border border-gray-800">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">🧠</span>
				Concept
			</h3>
			<div class="{SECTION_CONTENT} border-l-2 border-l-cyber-magenta bg-cyber-magenta/5">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.concept)}
			</div>
		</div>

		<div class="clip-card overflow-hidden border border-gray-800">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">💡</span>
				Why It Matters
			</h3>
			<div class="{SECTION_CONTENT} border-l-2 border-l-cyber-cyan bg-cyber-cyan/5">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.whyItMatters)}
			</div>
		</div>
	</section>
</article>
