import assert from 'node:assert/strict';
import test from 'node:test';

import {
	MODULE_SHIFT_BY,
	MODULE_SHIFT_FROM,
	STORAGE_VERSION,
	migrateLegacyV1,
	shiftLessonId,
	shiftProgressToV3
} from '../src/lib/stores/progressMigrations.js';

test('lessons before the diagram module keep their id', () => {
	assert.equal(shiftLessonId(1), 1);
	assert.equal(shiftLessonId(25), 25);
	assert.equal(shiftLessonId(MODULE_SHIFT_FROM - 1), MODULE_SHIFT_FROM - 1);
});

test('diagram lessons move by the module shift', () => {
	assert.equal(STORAGE_VERSION, 3);
	assert.equal(shiftLessonId(26), 26 + MODULE_SHIFT_BY);
	assert.equal(shiftLessonId(31), 31 + MODULE_SHIFT_BY);
});

test('a v2 payload keeps every part of the stored progress', () => {
	const shifted = shiftProgressToV3({
		currentLesson: 27,
		completedLessons: [3, 26, 27, 27, 31],
		editorContents: { 26: 'a', 5: 'b', 'not-a-number': 'c' }
	});

	assert.equal(shifted.currentLesson, 31);
	assert.deepEqual(shifted.completedLessons, [3, 30, 31, 35]);
	assert.deepEqual(shifted.editorContents, { 30: 'a', 5: 'b', 'not-a-number': 'c' });
});

test('a legacy payload chains through both migrations', () => {
	const v2 = migrateLegacyV1({
		currentLesson: 4,
		completedLessons: [1, 10],
		editorContents: { 2: 'code' }
	});

	assert.equal(v2.currentLesson, 13);
	assert.deepEqual(v2.completedLessons, [10, 19]);
	assert.deepEqual(v2.editorContents, { 11: 'code' });

	const v3 = shiftProgressToV3(v2);
	assert.equal(v3.currentLesson, 13);
	assert.deepEqual(v3.completedLessons, [10, 19]);
	assert.deepEqual(v3.editorContents, { 11: 'code' });
});

test('empty payloads fall back to sensible defaults', () => {
	assert.deepEqual(shiftProgressToV3({}), {
		currentLesson: 1,
		completedLessons: [],
		editorContents: {}
	});
});
