/**
 * Course index.
 *
 * The app hosts two independent projects ("modules"). Each one has its own
 * playground content and its own set of lessons, and each one closes with a
 * challenge lesson (`type: 'challenge'`): 80% of the structure the learner just
 * built, 20% of new reasoning.
 *
 *   Module 1 — JavaScript             · Pixel Art Editor        (lessons 1–26)
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
			'Build a drawing app pixel by pixel, starting with your first program. Learn to run code, inspect values, make decisions and respond to a click before the editor grows into a Canvas application with real data structures.',
		description:
			'Build the pixel editor in the DOM first, collapse it on purpose at 16,384 elements, rescue it with Canvas, and then add the data structures that make it scale: flat arrays, typed memory (Uint8Array), DFS, a BFS queue and a ring buffer for history.',
		from: 1,
		to: 26
	}
];

/**
 * Curriculum phases. The UI reads the label from here so that adding or moving
 * lessons only requires editing this table.
 */
export const phases = [
	{ id: 1, label: 'Phase 1: Programming Foundations', from: 1, to: 8 },
	{ id: 2, label: 'Phase 2: Build an Interactive Editor', from: 9, to: 16 },
	{ id: 3, label: 'Phase 3: Representation and Performance', from: 17, to: 20 },
	{ id: 4, label: 'Phase 4: Data Structures and Algorithms', from: 21, to: 25 },
	{ id: 5, label: 'Phase 5: Closing', from: 26, to: 26 }
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
	{ id: 1, title: 'Run Your First Program' },
	{ id: 2, title: 'Work With Values' },
	{ id: 3, title: 'Name What Changes' },
	{ id: 4, title: 'Update a Value' },
	{ id: 5, title: 'Give Code a Job' },
	{ id: 6, title: 'Ask a Question' },
	{ id: 7, title: 'Choose What Happens' },
	{ id: 8, title: 'Read Errors and Inspect Values' },
	{ id: 9, title: 'Your First Pixel' },
	{ id: 10, title: 'Give the Code a Job' },
	{ id: 11, title: 'Make Decisions' },
	{ id: 12, title: 'Repeat the Work' },
	{ id: 13, title: 'Work With Collections' },
	{ id: 14, title: 'Describe Things' },
	{ id: 15, title: 'Talk to the Page' },
	{ id: 16, title: 'Listen to the User' },
	{ id: 17, title: 'The DOM Limit' },
	{ id: 18, title: 'The Rescue (Canvas)' },
	{ id: 19, title: 'Where Does a Pixel Live?' },
	{ id: 20, title: 'Typed Memory' },
	{ id: 21, title: 'Fill the Area' },
	{ id: 22, title: 'Find the Recursion Limit' },
	{ id: 23, title: 'Queue It' },
	{ id: 24, title: 'The Border Inspector', type: 'challenge' },
	{ id: 25, title: 'Bounded History' },
	{ id: 26, title: 'Project Close: Interview Room' }
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
	18: () => import('./curriculum/lesson-18.js'),
	19: () => import('./curriculum/lesson-19.js'),
	20: () => import('./curriculum/lesson-20.js'),
	21: () => import('./curriculum/lesson-21.js'),
	22: () => import('./curriculum/lesson-22.js'),
	23: () => import('./curriculum/lesson-23.js'),
	24: () => import('./curriculum/lesson-24.js'),
	25: () => import('./curriculum/lesson-25.js'),
	26: () => import('./curriculum/lesson-26.js')
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
