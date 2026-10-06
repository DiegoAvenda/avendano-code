<script>
	import { renderMarkdown } from '#lib/markdown.js';

	/**
	 * @type {{ lesson: any }}
	 */
	let { lesson } = $props();

	const SECTION_HEADING =
		'flex items-center gap-2 border-b border-line bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-ink';
	const SECTION_CONTENT = 'p-3.5 text-[13px] leading-relaxed text-muted';
</script>

<article
	class="h-full [scrollbar-width:thin] [scrollbar-color:var(--color-surface-3)_transparent] overflow-y-auto p-5"
>
	<header class="mb-5 border-b border-line pb-3">
		<div class="flex flex-wrap items-center gap-2">
			<h2 class="text-[22px] leading-tight font-bold text-ink">{lesson.title}</h2>
			{#if lesson.type === 'challenge'}
				<span
					class="rounded-full border border-[#ffd166] px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em] text-[#ffd166] uppercase"
				>
					Reto integrador
				</span>
			{/if}
		</div>
	</header>

	<section class="flex flex-col gap-5">
		<div class="text-sm leading-relaxed text-muted">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
			{@html renderMarkdown(lesson.description)}
		</div>

		<div class="overflow-hidden rounded-lg border border-line">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">🎯</span>
				Task
			</h3>
			<div class={SECTION_CONTENT}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.task)}
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border border-line">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">🧠</span>
				Concept
			</h3>
			<div class="{SECTION_CONTENT} border-l-[3px] border-l-[#8338ec] bg-[rgba(131,56,236,0.06)]">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.concept)}
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border border-line">
			<h3 class={SECTION_HEADING}>
				<span class="text-base">💡</span>
				Why It Matters
			</h3>
			<div class="{SECTION_CONTENT} border-l-[3px] border-l-[#48dbfb] bg-[rgba(72,219,251,0.06)]">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all input -->
				{@html renderMarkdown(lesson.whyItMatters)}
			</div>
		</div>
	</section>
</article>
