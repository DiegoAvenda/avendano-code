<script>
	/**
	 * @type {{ lesson: any }}
	 */
	let { lesson } = $props();
</script>

<article class="lesson-panel">
	<header class="lesson-header">
		<h2 class="lesson-title">{lesson.title}</h2>
	</header>

	<section class="lesson-body">
		<div class="lesson-description">
			{@html renderMarkdown(lesson.description)}
		</div>

		<div class="lesson-section">
			<h3 class="section-heading">
				<span class="section-icon">🎯</span>
				Task
			</h3>
			<div class="section-content">
				{@html renderMarkdown(lesson.task)}
			</div>
		</div>

		<div class="lesson-section">
			<h3 class="section-heading">
				<span class="section-icon">🧠</span>
				Concept
			</h3>
			<div class="section-content concept-box">
				{@html renderMarkdown(lesson.concept)}
			</div>
		</div>

		<div class="lesson-section">
			<h3 class="section-heading">
				<span class="section-icon">💡</span>
				Why It Matters
			</h3>
			<div class="section-content why-box">
				{@html renderMarkdown(lesson.whyItMatters)}
			</div>
		</div>
	</section>
</article>

<script module>
	/**
	 * Simple markdown-ish renderer for lesson content.
	 * Handles: **bold**, `code`, ```code blocks```, headers, lists, tables, links.
	 */
	function renderMarkdown(text) {
		if (!text) return '';

		let html = text
			// Escape HTML
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// Code blocks (```...```)
		html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
			return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
		});

		// Inline code
		html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

		// Bold
		html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

		// Italic
		html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

		// Headers (### h3, ## h2)
		html = html.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
		html = html.replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>');

		// Tables
		html = html.replace(
			/(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)+))/g,
			(match) => {
				const rows = match.trim().split('\n').filter(r => r.trim());
				if (rows.length < 2) return match;
				const headers = rows[0].split('|').filter(c => c.trim());
				const dataRows = rows.slice(2); // skip separator
				let table = '<table class="md-table"><thead><tr>';
				headers.forEach(h => { table += `<th>${h.trim()}</th>`; });
				table += '</tr></thead><tbody>';
				dataRows.forEach(row => {
					const cells = row.split('|').filter(c => c.trim());
					table += '<tr>';
					cells.forEach(c => { table += `<td>${c.trim()}</td>`; });
					table += '</tr>';
				});
				table += '</tbody></table>';
				return table;
			}
		);

		// Unordered lists
		html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="md-li md-ol">$2</li>');
		html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>');

		// Paragraphs (double newline)
		html = html.replace(/\n\n/g, '</p><p>');
		html = '<p>' + html + '</p>';

		// Clean up empty paragraphs
		html = html.replace(/<p>\s*<\/p>/g, '');
		html = html.replace(/<p>\s*(<h[34])/g, '$1');
		html = html.replace(/(<\/h[34]>)\s*<\/p>/g, '$1');
		html = html.replace(/<p>\s*(<pre)/g, '$1');
		html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
		html = html.replace(/<p>\s*(<table)/g, '$1');
		html = html.replace(/(<\/table>)\s*<\/p>/g, '$1');
		html = html.replace(/<p>\s*(<li)/g, '$1');
		html = html.replace(/(<\/li>)\s*<\/p>/g, '$1');

		return html;
	}
</script>

<style>
	.lesson-panel {
		height: 100%;
		overflow-y: auto;
		padding: 20px;
		scrollbar-width: thin;
		scrollbar-color: var(--surface-3, #3a3a5c) transparent;
	}
	.lesson-header {
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border, #2a2a44);
	}
	.lesson-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-primary, #e8e8f0);
		line-height: 1.3;
	}
	.lesson-body {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.lesson-description {
		font-size: 14px;
		line-height: 1.7;
		color: var(--text-secondary, #b0b0c8);
	}
	.lesson-section {
		border: 1px solid var(--border, #2a2a44);
		border-radius: 8px;
		overflow: hidden;
	}
	.section-heading {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary, #e0e0e0);
		padding: 10px 14px;
		background: var(--surface-2, #1e1e34);
		border-bottom: 1px solid var(--border, #2a2a44);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.section-icon {
		font-size: 16px;
	}
	.section-content {
		padding: 14px;
		font-size: 13px;
		line-height: 1.7;
		color: var(--text-secondary, #b0b0c8);
	}
	.concept-box {
		background: rgba(131, 56, 236, 0.06);
		border-left: 3px solid #8338ec;
	}
	.why-box {
		background: rgba(72, 219, 251, 0.06);
		border-left: 3px solid #48dbfb;
	}

	/* Markdown rendered elements */
	.lesson-panel :global(.code-block) {
		background: #111122;
		border: 1px solid #2a2a44;
		border-radius: 6px;
		padding: 12px;
		overflow-x: auto;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 12.5px;
		line-height: 1.6;
		margin: 8px 0;
	}
	.lesson-panel :global(.inline-code) {
		background: rgba(139, 139, 204, 0.15);
		color: #c4b5fd;
		padding: 1px 6px;
		border-radius: 3px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.9em;
	}
	.lesson-panel :global(.md-h3) {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary, #e0e0e0);
		margin: 16px 0 8px;
	}
	.lesson-panel :global(.md-h4) {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary, #d0d0e0);
		margin: 12px 0 6px;
	}
	.lesson-panel :global(.md-li) {
		margin-left: 20px;
		list-style: disc;
		margin-bottom: 4px;
	}
	.lesson-panel :global(.md-ol) {
		list-style: decimal;
	}
	.lesson-panel :global(.md-table) {
		width: 100%;
		border-collapse: collapse;
		margin: 8px 0;
		font-size: 12.5px;
	}
	.lesson-panel :global(.md-table th),
	.lesson-panel :global(.md-table td) {
		padding: 6px 10px;
		border: 1px solid #2a2a44;
		text-align: left;
	}
	.lesson-panel :global(.md-table th) {
		background: #1e1e34;
		font-weight: 600;
	}
	.lesson-panel :global(p) {
		margin-bottom: 8px;
	}
	.lesson-panel :global(strong) {
		color: var(--text-primary, #e0e0e0);
	}
</style>
