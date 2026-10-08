/**
 * Course index.
 *
 * The app hosts two independent projects ("modules"). Each one has its own
 * playground content and its own set of lessons, and each one closes with a
 * challenge lesson (`type: 'challenge'`): 80% of the structure the learner just
 * built, 20% of new reasoning.
 *
 *   Module 0 — Foundations Lab        · Pixel Art Editor        (lessons 1–30)
 *   Module 1 — Flowchart & Diagram    · Diagram Builder         (lessons 31–39)
 *
 * This module ships only lesson *metadata* (id + title + optional type) plus the
 * module and phase tables. The prose and starter code for each lesson live in
 * `./curriculum/lesson-NN.js` and are imported on demand.
 */

export const modules = [
	{
		id: 'foundations',
		label: 'Module 1 — JavaScript',
		short: 'Module 1 · JavaScript',
		project: 'Pixel Art Editor',
		stack: ['JavaScript', 'DOM', 'Canvas 2D', 'Uint8Array'],
		pitch:
			'Build a drawing app pixel by pixel, starting from zero. You begin with the visible pieces of a web page, watch the app freeze when it grows, and then learn what real applications do instead: keep the data efficient and repaint only what changed. It closes with undo history and an outline-detection challenge.',
		description:
			'Build the pixel editor in the DOM first, collapse it on purpose at 16,384 elements, rescue it with Canvas, and then add the data structures that make it scale: flat arrays, typed memory (Uint8Array), DFS, a BFS queue and a ring buffer for history.',
		from: 1,
		to: 18
	}
];

/**
 * Curriculum phases. The UI reads the label from here so that adding or moving
 * lessons only requires editing this table.
 */
export const phases = [
	{ id: 1, label: 'Phase 1: Visual JavaScript with the DOM', from: 1, to: 10 },
	{ id: 2, label: 'Phase 2: Visual Data Structures and Algorithms', from: 11, to: 17 },
	{ id: 3, label: 'Phase 3: Closing', from: 18, to: 18 }
];

/**
 * @param {number} lessonId
 * @returns {string} Label of the phase that contains `lessonId`, or ''.
 */
export function getPhaseLabel(lessonId) {
	const phase = phases.find((entry) => lessonId >= entry.from && lessonId <= entry.to);
	return phase ? phase.label : '';
}

/**
 * @param {number} lessonId
 * @returns {(typeof modules)[number] | undefined}
 */
export function getModule(lessonId) {
	return modules.find((entry) => lessonId >= entry.from && lessonId <= entry.to);
}

/**
 * Lightweight lesson index: everything the shell needs before a lesson loads.
 * `type: 'challenge'` marks the boss fight that closes each module's main arc.
 */
export const lessonList = [
	// Module 1 — Pixel Art Editor
	{ id: 1, title: 'Your First Pixel' },
	{ id: 2, title: 'Give the Code a Job' },
	{ id: 3, title: 'Make Decisions' },
	{ id: 4, title: 'Repeat the Work' },
	{ id: 5, title: 'Work With Collections' },
	{ id: 6, title: 'Describe Things' },
	{ id: 7, title: 'Talk to the Page' },
	{ id: 8, title: 'Listen to the User' },
	{ id: 9, title: 'The DOM Limit' },
	{ id: 10, title: 'The Rescue (Canvas)' },
	{ id: 11, title: 'Where Does a Pixel Live?' },
	{ id: 12, title: 'Typed Memory' },
	{ id: 13, title: 'Fill the Area' },
	{ id: 14, title: 'Find the Recursion Limit' },
	{ id: 15, title: 'Queue It' },
	{ id: 16, title: 'The Border Inspector', type: 'challenge' },
	{ id: 17, title: 'Bounded History' },
	{ id: 18, title: 'Project Close: Definition of Done' }
];

/** @type {Record<number, () => Promise<{ default: any }>>} */
const loaders = {
	1: () => import('./curriculum/lesson-01.js'),
	2: () => import('./curriculum/lesson-02.js'),
	3: () => import('./curriculum/lesson-03.js'),
	4: () => import('./curriculum/lesson-04.js'),
	5: () => import('./curriculum/lesson-05.js'),
	6: () => import('./curriculum/lesson-06.js'),
	7: () => import('./curriculum/lesson-07.js'),
	8: () => import('./curriculum/lesson-08.js'),
	9: () => import('./curriculum/lesson-09.js'),
	10: () => import('./curriculum/lesson-10.js'),
	11: () => import('./curriculum/lesson-11.js'),
	12: () => import('./curriculum/lesson-12.js'),
	13: () => import('./curriculum/lesson-13.js'),
	14: () => import('./curriculum/lesson-14.js'),
	15: () => import('./curriculum/lesson-15.js'),
	16: () => import('./curriculum/lesson-16.js'),
	17: () => import('./curriculum/lesson-17.js'),
	18: () => import('./curriculum/lesson-18.js')
};

/**
 * Load the full lesson (prose + starter code for HTML/CSS/JS).
 * @param {number} id
 */
export async function loadLesson(id) {
	const loader = loaders[id];
	if (!loader) throw new Error(`Unknown lesson id: ${id}`);
	const module = await loader();
	return module.default;
}

/** Load every lesson. Used by the test suite and by tooling. */
export function loadAllLessons() {
	return Promise.all(lessonList.map((lesson) => loadLesson(lesson.id)));
}
