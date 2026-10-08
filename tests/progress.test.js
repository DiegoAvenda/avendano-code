import assert from 'node:assert/strict';
import test from 'node:test';

import {
	CHALLENGE_INSERT_AFTER,
	MODULE_SHIFT_BY,
	MODULE_SHIFT_FROM,
	SECOND_CHALLENGE_INSERT_AFTER,
	STORAGE_VERSION,
	migrateLegacyV1,
	migrateToCurrent,
	shiftLessonId,
	shiftProgressToV3,
	shiftProgressToV4
} from '../src/lib/stores/progressMigrations.js';

test('lessons before the diagram module keep their id', () => {
	assert.equal(shiftLessonId(1), 1);
	assert.equal(shiftLessonId(25), 25);
	assert.equal(shiftLessonId(MODULE_SHIFT_FROM - 1), MODULE_SHIFT_FROM - 1);
});

test('diagram lessons move by the module shift', () => {
	assert.equal(STORAGE_VERSION, 5);
	assert.equal(shiftLessonId(26), 26 + MODULE_SHIFT_BY);
	assert.equal(shiftLessonId(31), 31 + MODULE_SHIFT_BY);
});

test('v3 ids shift around the two challenge lessons', () => {
	const shifted = shiftProgressToV4({
		currentLesson: 33,
		completedLessons: [15, 16, 32, 33, 37],
		editorContents: { 15: 'a', 16: 'b', 33: 'c', 37: 'd' }
	});

	assert.equal(shifted.currentLesson, 35);
	assert.deepEqual(shifted.completedLessons, [15, 17, 33, 35, 39]);
	assert.deepEqual(shifted.editorContents, { 15: 'a', 17: 'b', 35: 'c', 39: 'd' });
});

test('the challenge boundaries are the ones the curriculum uses', () => {
	assert.equal(CHALLENGE_INSERT_AFTER, 15);
	assert.equal(SECOND_CHALLENGE_INSERT_AFTER, 32);
	assert.equal(shiftProgressToV4({ currentLesson: 16 }).currentLesson, 17);
	assert.equal(shiftProgressToV4({ currentLesson: 32 }).currentLesson, 33);
	assert.equal(shiftProgressToV4({ currentLesson: 33 }).currentLesson, 35);
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

	const current = migrateToCurrent(v2);
	assert.equal(current.currentLesson, 13);
	assert.deepEqual(current.completedLessons, [10]);
	assert.deepEqual(current.editorContents, { 11: 'code' });
});

test('empty payloads fall back to sensible defaults', () => {
	assert.deepEqual(shiftProgressToV3({}), {
		currentLesson: 1,
		completedLessons: [],
		editorContents: {}
	});
});
