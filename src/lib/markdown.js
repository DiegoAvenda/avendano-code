/**
 * Dependency-free Markdown renderer for lesson content.
 *
 * Supported subset: paragraphs, `##`/`###` headings, fenced code blocks,
 * ordered/unordered lists (nested one level), GitHub-style tables, inline
 * code, **bold**, *italic* and links.
 *
 * SECURITY: every piece of source text is HTML-escaped before markup is
 * added, and the only tags this module can emit are the fixed ones below.
 * Untrusted input can therefore only produce literal text, which is what
 * makes it safe to inject the result with `{@html ...}`.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/** @param {string} text */
function escapeHtml(text) {
	return String(text).replace(/[&<>]/g, (char) => ESCAPES[char]);
}

/** Only these link targets are allowed through (blocks `javascript:` etc.). */
const SAFE_LINK = /^(?:https?:\/\/|mailto:|#|\/)/i;

const LIST_ITEM_RE = /^(\s*)(?:([-*])|(\d+)\.)\s+(.*)$/;

/**
 * Format inline spans. The input must already be HTML-escaped.
 * @param {string} text
 */
function renderInline(text) {
	// Split out `code spans` first so their contents are never formatted.
	const parts = text.split(/(`[^`]+`)/g);

	return parts
		.map((part) => {
			if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
				return `<code class="md-code-inline">${part.slice(1, -1)}</code>`;
			}

			let out = part.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
			out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
			out = out.replace(/\[([^\]]+)\]\(([^()\s]+)\)/g, (match, label, href) => {
				if (!SAFE_LINK.test(href)) return match;
				const safeHref = href.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
				return `<a class="md-link" href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
			});
			return out;
		})
		.join('');
}

/** @param {string} line */
function splitTableRow(line) {
	return line
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((cell) => cell.trim());
}

/**
 * @param {string[]} lines
 * @param {number} index
 */
function isTableStart(lines, index) {
	if (index + 1 >= lines.length) return false;
	if (!/^\s*\|.*\|\s*$/.test(lines[index])) return false;
	return /^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1]);
}

/**
 * @param {string[]} lines
 * @param {number} start
 */
function parseTable(lines, start) {
	const headers = splitTableRow(lines[start]);
	/** @type {string[][]} */
	const rows = [];

	let i = start + 2;
	while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
		rows.push(splitTableRow(lines[i]));
		i++;
	}

	const head = headers.map((cell) => `<th>${renderInline(escapeHtml(cell))}</th>`).join('');
	const body = rows
		.map((row) => {
			const cells = row.map((cell) => `<td>${renderInline(escapeHtml(cell))}</td>`).join('');
			return `<tr>${cells}</tr>`;
		})
		.join('');

	return {
		html: `<table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
		next: i
	};
}

/**
 * Parse a run of list items, recursing into indented sub-lists.
 * @param {string[]} lines
 * @param {number} start
 */
function parseList(lines, start) {
	const first = lines[start].match(LIST_ITEM_RE);
	const ordered = Boolean(first && first[3]);
	const baseIndent = first ? first[1].length : 0;
	/** @type {Array<{ text: string, children: string[] }>} */
	const items = [];

	let i = start;
	while (i < lines.length) {
		if (/^\s*$/.test(lines[i])) break;

		const match = lines[i].match(LIST_ITEM_RE);
		if (!match) break;

		const indent = match[1].length;
		if (indent < baseIndent) break;

		if (indent > baseIndent) {
			const nested = parseList(lines, i);
			if (items.length) items[items.length - 1].children.push(nested.html);
			i = nested.next;
			continue;
		}

		items.push({ text: match[4], children: [] });
		i++;
	}

	const tag = ordered ? 'ol' : 'ul';
	const body = items
		.map((item) => {
			const text = renderInline(escapeHtml(item.text));
			return `<li class="md-li">${text}${item.children.join('')}</li>`;
		})
		.join('');

	return { html: `<${tag} class="md-list">${body}</${tag}>`, next: i };
}

/**
 * Render the Markdown subset used by the lesson curriculum.
 * @param {string | undefined | null} source
 * @returns {string}
 */
export function renderMarkdown(source) {
	if (!source) return '';

	const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
	/** @type {string[]} */
	const blocks = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (/^\s*$/.test(line)) {
			i++;
			continue;
		}

		// Fenced code block — consumed verbatim so blank lines inside it survive.
		if (/^```/.test(line)) {
			const code = [];
			i++;
			while (i < lines.length && !/^```\s*$/.test(lines[i])) {
				code.push(lines[i]);
				i++;
			}
			i++; // closing fence (or end of input)
			blocks.push(
				`<pre class="md-code-block"><code>${escapeHtml(code.join('\n').trim())}</code></pre>`
			);
			continue;
		}

		const h4 = line.match(/^###\s+(.*)$/);
		if (h4) {
			blocks.push(`<h4 class="md-h4">${renderInline(escapeHtml(h4[1]))}</h4>`);
			i++;
			continue;
		}

		const h3 = line.match(/^##\s+(.*)$/);
		if (h3) {
			blocks.push(`<h3 class="md-h3">${renderInline(escapeHtml(h3[1]))}</h3>`);
			i++;
			continue;
		}

		if (isTableStart(lines, i)) {
			const table = parseTable(lines, i);
			blocks.push(table.html);
			i = table.next;
			continue;
		}

		if (LIST_ITEM_RE.test(line)) {
			const list = parseList(lines, i);
			blocks.push(list.html);
			i = list.next;
			continue;
		}

		// Paragraph: soft-wrapped lines joined with spaces.
		const paragraph = [];
		while (i < lines.length) {
			const current = lines[i];
			if (
				/^\s*$/.test(current) ||
				/^```/.test(current) ||
				/^#{2,3}\s/.test(current) ||
				LIST_ITEM_RE.test(current) ||
				isTableStart(lines, i)
			) {
				break;
			}
			paragraph.push(current.trim());
			i++;
		}
		blocks.push(`<p>${renderInline(escapeHtml(paragraph.join(' ')))}</p>`);
	}

	return blocks.join('\n');
}
