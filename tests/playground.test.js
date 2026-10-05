import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSrcDoc } from '../src/lib/playground/buildSrcDoc.js';
import { parseIframeMessage } from '../src/lib/playground/iframeProtocol.js';

const code = (overrides = {}) => ({ html: '', css: '', javascript: '', ...overrides });

test('injects the console bridge into an existing head', () => {
	const html = buildSrcDoc(code({ html: '<html><HEAD></HEAD><body></body></html>' }));
	assert.ok(html.includes('__playground'));
	assert.ok(html.indexOf('<head') < html.indexOf('__playground'));
});

test('inlines stylesheets and scripts instead of linking them', () => {
	const out = buildSrcDoc(
		code({
			html: '<head><link rel="stylesheet" href="style.css" /></head><body></body>',
			css: 'body { color: red; }',
			javascript: 'console.log(1);'
		})
	);
	assert.ok(!out.includes('<link'), 'stylesheet link should be removed');
	assert.ok(out.includes('<style>body { color: red; }</style>'));
	assert.ok(out.includes('console.log(1);'));
});

test('a closing script tag inside user JavaScript cannot break the preview', () => {
	const out = buildSrcDoc(code({ javascript: 'const s = "</script>";' }));
	assert.ok(out.includes('const s = "<\\/script>";'), 'the sequence must be escaped');
	assert.ok(!out.includes('"</script>"'), 'the raw sequence must not survive');
});

test('escapes closing style tags inside user CSS', () => {
	const out = buildSrcDoc(code({ css: 'a::after { content: "</style>"; }' }));
	assert.ok(out.includes('<\\/style'), 'the sequence must be escaped');
});

test('appends the script when the HTML has no body tag', () => {
	const out = buildSrcDoc(code({ html: '<div id="app"></div>', javascript: 'window.x = 1;' }));
	assert.ok(out.trimEnd().endsWith('</scr' + 'ipt>'));
});

test('ignores unrelated postMessage payloads', () => {
	assert.equal(parseIframeMessage({ data: { hello: 'world' } }), null);
	assert.equal(parseIframeMessage({ data: null }), null);
	assert.deepEqual(parseIframeMessage({ data: { __playground: true, type: 'log', args: ['a'] } }), {
		type: 'log',
		args: ['a']
	});
	assert.deepEqual(parseIframeMessage({ data: { __playground: true, type: 'error' } }), {
		type: 'error',
		args: []
	});
});

test('the bridge captures its target before lesson code can shadow "parent"', () => {
	const out = buildSrcDoc(
		code({ javascript: 'const parent = new Map();\nconsole.log("union-find");' })
	);

	assert.ok(
		out.includes('const bridgeTarget = window.parent;'),
		'the bridge must capture window.parent before any lesson script runs'
	);
	assert.ok(
		out.includes('bridgeTarget.postMessage('),
		'the bridge must post through the captured target'
	);
	assert.ok(
		!/[^.\w]parent\.postMessage\(/.test(out),
		'the bridge must not call the shadowable global "parent"'
	);
});
