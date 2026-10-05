import assert from 'node:assert/strict';
import test from 'node:test';

import { renderMarkdown } from '../src/lib/markdown.js';

test('renders blank lines inside a fenced code block without corrupting it', () => {
	const html = renderMarkdown('```\nfirst\n\nsecond\n```');
	assert.equal(html, '<pre class="md-code-block"><code>first\n\nsecond</code></pre>');
	assert.ok(!html.includes('</p><p>'), 'paragraph tags must never leak into a code block');
});

test('escapes HTML in prose and inside code spans', () => {
	const html = renderMarkdown('Use `<canvas>` and <script>alert(1)</script> here.');
	assert.ok(html.includes('<code class="md-code-inline">&lt;canvas&gt;</code>'));
	assert.ok(!html.includes('<script>'), 'raw script tags must be escaped');
	assert.ok(html.includes('&lt;script&gt;'));
});

test('renders unordered and ordered lists with real list containers', () => {
	assert.equal(
		renderMarkdown('- one\n- two'),
		'<ul class="md-list"><li class="md-li">one</li><li class="md-li">two</li></ul>'
	);
	assert.equal(
		renderMarkdown('1. one\n2. two'),
		'<ol class="md-list"><li class="md-li">one</li><li class="md-li">two</li></ol>'
	);
});

test('nests an indented list inside the previous item', () => {
	const html = renderMarkdown('1. Build it:\n   - first\n   - second\n2. Done');
	assert.ok(html.startsWith('<ol class="md-list">'));
	assert.ok(html.includes('<ul class="md-list"><li class="md-li">first</li>'));
	assert.ok(html.trim().endsWith('</ol>'));
});

test('renders tables including empty header cells', () => {
	const html = renderMarkdown('| | A | B |\n|---|---|---|\n| row | 1 | 2 |');
	assert.equal(
		html,
		'<table class="md-table"><thead><tr><th></th><th>A</th><th>B</th></tr></thead>' +
			'<tbody><tr><td>row</td><td>1</td><td>2</td></tr></tbody></table>'
	);
});

test('renders headings, bold and inline code', () => {
	const html = renderMarkdown('## Title\n\nSome **bold** and `code`.\n\n### Sub');
	assert.ok(html.includes('<h3 class="md-h3">Title</h3>'));
	assert.ok(html.includes('<h4 class="md-h4">Sub</h4>'));
	assert.ok(html.includes('<strong>bold</strong>'));
	assert.ok(html.includes('<code class="md-code-inline">code</code>'));
});

test('allows safe links and refuses javascript: URLs', () => {
	const safe = renderMarkdown('See [docs](https://example.com/a).');
	assert.ok(safe.includes('<a class="md-link" href="https://example.com/a"'));

	const unsafe = renderMarkdown('See [click](javascript:alert(1)).');
	assert.ok(!unsafe.includes('<a '), 'unsafe protocols must not become links');
});

test('returns an empty string for empty input', () => {
	assert.equal(renderMarkdown(''), '');
	assert.equal(renderMarkdown(undefined), '');
});
