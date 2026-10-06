import assert from 'node:assert/strict';
import test from 'node:test';

import {
	getModule,
	getPhaseLabel,
	lessonList,
	loadAllLessons,
	loadLesson,
	modules,
	phases
} from '../src/lib/content/pixel-editor/lessons.js';

const lessons = await loadAllLessons();

const FIELDS = ['title', 'description', 'task', 'concept', 'whyItMatters'];

/** @param {string} js */
function assertParses(js) {
	assert.doesNotThrow(() => new Function(js), 'starter code must be valid JavaScript');
}

/** @param {string} source */
function cssClasses(source) {
	const classes = new Set();
	for (const match of source.matchAll(/class(?:Name)?\s*[=:]\s*["'`]([^"'`]+)/g)) {
		match[1]
			.split(/\s+/)
			.filter(Boolean)
			.forEach((name) => classes.add(name));
	}
	for (const match of source.matchAll(/classList\.(?:add|remove|toggle)\(\s*["']([^"']+)/g)) {
		classes.add(match[1]);
	}
	return classes;
}

/** @param {string} source */
function referencedIds(source) {
	const ids = new Set();
	for (const match of source.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) {
		ids.add(match[1]);
	}
	return ids;
}

/** @param {string} html */
function declaredIds(html) {
	return new Set([...html.matchAll(/id=["']([^"']+)["']/g)].map((match) => match[1]));
}

test('lesson ids are unique and sequential starting at 1', () => {
	const ids = lessons.map((lesson) => lesson.id);
	assert.deepEqual(ids, [...new Set(ids)], 'lesson ids must be unique');
	assert.deepEqual(
		ids,
		Array.from({ length: lessons.length }, (_, index) => index + 1),
		'lesson ids must be sequential'
	);
});

test('the shipped lesson index stays lightweight (metadata only)', () => {
	for (const entry of lessonList) {
		const expectedKeys = entry.type === undefined ? ['id', 'title'] : ['id', 'title', 'type'];
		assert.deepEqual(
			Object.keys(entry).sort(),
			expectedKeys,
			`index entry for lesson ${entry.id} should only carry id, title and an optional type`
		);

		if (entry.type !== undefined) {
			assert.equal(entry.type, 'challenge', `lesson ${entry.id} has an unknown type`);
		}
	}
});

test('challenge lessons are flagged in both the index and the content', () => {
	const flagged = lessonList.filter((entry) => entry.type === 'challenge');
	assert.ok(flagged.length >= 2, 'each module should close its arc with a challenge');

	for (const entry of flagged) {
		const lesson = lessons.find((candidate) => candidate.id === entry.id);
		assert.equal(lesson.type, 'challenge', `lesson ${entry.id} should carry type: 'challenge'`);
		assert.ok(
			lesson.description.includes('Reto integrador'),
			`challenge lesson ${entry.id} should announce itself in its prose`
		);
	}
});

test('each module has at least one challenge', () => {
	for (const module of modules) {
		const challenges = lessonList.filter(
			(entry) => entry.type === 'challenge' && entry.id >= module.from && entry.id <= module.to
		);
		assert.ok(challenges.length >= 1, `module "${module.label}" has no challenge lesson`);
	}
});

test('every indexed lesson loads and matches its metadata', async () => {
	const loaded = await loadAllLessons();
	assert.equal(loaded.length, lessonList.length);

	for (const [index, entry] of lessonList.entries()) {
		assert.equal(loaded[index].id, entry.id);
		assert.equal(loaded[index].title, entry.title);
	}

	await assert.rejects(() => loadLesson(999), /Unknown lesson id/);
});

test('modules partition the curriculum without gaps or overlaps', () => {
	const covered = [];

	for (const module of modules) {
		assert.ok(module.from <= module.to, `module "${module.label}" has an empty range`);
		assert.ok(module.project.length > 0, `module "${module.label}" has no project name`);
		for (let id = module.from; id <= module.to; id++) covered.push(id);
	}

	covered.sort((a, b) => a - b);
	assert.deepEqual(
		covered,
		lessons.map((lesson) => lesson.id),
		'modules must cover each lesson once'
	);

	for (const lesson of lessons) {
		const owner = getModule(lesson.id);
		assert.ok(owner, `lesson ${lesson.id} belongs to no module`);
	}
});

test('every lesson declares all required non-empty fields', () => {
	for (const lesson of lessons) {
		for (const field of FIELDS) {
			assert.ok(
				typeof lesson[field] === 'string' && lesson[field].trim().length > 0,
				`lesson ${lesson.id} is missing "${field}"`
			);
		}
	}
});

test('every lesson ships non-empty starter code for all three tabs', () => {
	for (const lesson of lessons) {
		for (const tab of ['html', 'css', 'javascript']) {
			assert.ok(
				typeof lesson.starterCode?.[tab] === 'string' && lesson.starterCode[tab].trim().length > 0,
				`lesson ${lesson.id} has empty starterCode.${tab}`
			);
		}
	}
});

test('every starter script parses as JavaScript', () => {
	for (const lesson of lessons) {
		try {
			assertParses(lesson.starterCode.javascript);
		} catch (error) {
			assert.fail(`lesson ${lesson.id}: ${error.message}`);
		}
	}
});

test('every DOM id used by the starter script exists in the lesson HTML', () => {
	for (const lesson of lessons) {
		const html = lesson.starterCode.html;
		const htmlIds = declaredIds(html);
		for (const id of referencedIds(lesson.starterCode.javascript)) {
			assert.ok(htmlIds.has(id), `lesson ${lesson.id} queries #${id} but never defines it`);
		}
	}
});

test('every CSS class used by the starter code is defined in the lesson CSS', () => {
	for (const lesson of lessons) {
		const css = lesson.starterCode.css;
		const source = `${lesson.starterCode.html}\n${lesson.starterCode.javascript}`;
		for (const name of cssClasses(source)) {
			const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			assert.match(
				css,
				new RegExp(`\\.${escaped}(?![\\w-])`),
				`lesson ${lesson.id} uses class "${name}" but never styles it`
			);
		}
	}
});

test('lesson titles and script headers carry their module project and id', () => {
	for (const lesson of lessons) {
		const owner = getModule(lesson.id);
		const prefix = `${owner.project} — Lesson ${lesson.id}`;

		assert.ok(
			lesson.starterCode.html.includes(`<title>${prefix}`),
			`lesson ${lesson.id} should have a "<title>${prefix}" tag`
		);
		assert.ok(
			lesson.starterCode.javascript.startsWith(`// ${prefix}`),
			`lesson ${lesson.id} should start with "// ${prefix}"`
		);
	}
});

test('phases and modules cover every lesson exactly once', () => {
	for (const lesson of lessons) {
		assert.ok(getPhaseLabel(lesson.id), `lesson ${lesson.id} is outside every phase`);
	}

	for (const phase of phases) {
		const covered = lessons.filter((lesson) => lesson.id >= phase.from && lesson.id <= phase.to);
		assert.ok(covered.length > 0, `phase "${phase.label}" covers no lessons`);
	}

	for (const module of modules) {
		const coveredPhases = phases.filter(
			(phase) => phase.from >= module.from && phase.to <= module.to
		);
		assert.ok(coveredPhases.length > 0, `module "${module.label}" has no phases`);
	}

	for (const phase of phases) {
		const owner = getModule(phase.from);
		assert.ok(owner, `phase "${phase.label}" starts outside every module`);
		assert.ok(
			phase.to <= owner.to,
			`phase "${phase.label}" crosses the boundary of module "${owner.label}"`
		);
	}
});
