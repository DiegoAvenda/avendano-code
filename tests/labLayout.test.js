import assert from 'node:assert/strict';
import test from 'node:test';

import {
	LAB_LAYOUT_DEFAULTS,
	LAB_LAYOUT_KEY,
	loadLabLayout,
	parseLabLayout,
	saveLabLayout
} from '../src/lib/stores/labLayout.js';

/** Minimal in-memory stand-in for localStorage. */
function fakeStorage(value) {
	/** @type {Map<string, string>} */
	const entries = new Map();
	if (value !== undefined) entries.set(LAB_LAYOUT_KEY, value);

	return {
		getItem: (key) => entries.get(key) ?? null,
		setItem: (key, next) => entries.set(key, String(next)),
		raw: entries
	};
}

test('a layout payload that is not an object falls back to the defaults', () => {
	assert.deepEqual(parseLabLayout(null), LAB_LAYOUT_DEFAULTS);
	assert.deepEqual(parseLabLayout('nonsense'), LAB_LAYOUT_DEFAULTS);
	assert.deepEqual(parseLabLayout([1, 2, 3]), LAB_LAYOUT_DEFAULTS);
	assert.deepEqual(parseLabLayout({}), LAB_LAYOUT_DEFAULTS);
});

test('sizes outside their bounds are clamped instead of trusted', () => {
	const tiny = parseLabLayout({ lessonW: 12, consoleH: 1 });
	assert.equal(tiny.lessonW, 240);
	assert.equal(tiny.consoleH, 120);

	const huge = parseLabLayout({ lessonW: 99999, consoleH: 99999, editorW: 99999 });
	assert.equal(huge.lessonW, 640);
	assert.equal(huge.consoleH, 560);
	assert.equal(huge.editorW, 2600);
});

test('corrupt individual values fall back without dropping the readable ones', () => {
	const layout = parseLabLayout({
		lessonW: 'wide',
		editorW: Number.NaN,
		consoleH: 300,
		consolePinned: true,
		fitPreview: false
	});

	assert.equal(layout.lessonW, LAB_LAYOUT_DEFAULTS.lessonW);
	assert.equal(layout.editorW, null);
	assert.equal(layout.consoleH, 300);
	assert.equal(layout.consolePinned, true);
	assert.equal(layout.fitPreview, false);
});

test('a fresh learner gets fit preview and an unpinned console', () => {
	const layout = parseLabLayout({});
	assert.equal(layout.consolePinned, false);
	assert.equal(layout.fitPreview, true);
	assert.equal(layout.editorW, null);
});

test('reading a corrupt payload never throws', () => {
	assert.deepEqual(loadLabLayout(fakeStorage('{not json')), LAB_LAYOUT_DEFAULTS);
	assert.deepEqual(loadLabLayout(fakeStorage(undefined)), LAB_LAYOUT_DEFAULTS);
	assert.deepEqual(loadLabLayout(undefined), LAB_LAYOUT_DEFAULTS);
});

test('saving sanitises what it writes, so a reload can trust the payload', () => {
	const storage = fakeStorage();
	saveLabLayout({ lessonW: 10, consoleH: 400, editorW: 700 }, storage);

	const stored = JSON.parse(storage.raw.get(LAB_LAYOUT_KEY) ?? 'null');
	assert.equal(stored.lessonW, 240);
	assert.equal(stored.consoleH, 400);
	assert.equal(stored.editorW, 700);
	assert.deepEqual(loadLabLayout(storage), stored);
});
