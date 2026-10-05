/**
 * Course index.
 *
 * The app hosts two independent projects ("modules"). Each one has its own
 * playground content and its own set of lessons:
 *
 *   Módulo 0 — Foundations Lab        · Pixel Art Editor        (lessons 1–29)
 *   Módulo 1 — Flowchart & Diagram    · Diagram Builder         (lessons 30–37)
 *
 * This module ships only lesson *metadata* (id + title) plus the module and
 * phase tables. The prose and starter code for each lesson live in
 * `./curriculum/lesson-NN.js` and are imported on demand.
 */

export const modules = [
	{
		id: 'foundations',
		label: 'Módulo 0 — Foundations Lab',
		short: 'Módulo 0 · Foundations Lab',
		project: 'Pixel Art Editor',
		description:
			'Build a pixel art editor from scratch and let it evolve with your knowledge: from plain DOM and CSS to Canvas, typed arrays, DFS, BFS, queues, ring buffers, modules, build tools, TypeScript, tests and resource lifetime.',
		from: 1,
		to: 29
	},
	{
		id: 'diagram',
		label: 'Módulo 1 — Flowchart & Diagram Builder',
		short: 'Módulo 1 · Diagram Builder',
		project: 'Diagram Builder',
		description:
			'Build a diagram editor on a real Vite + TypeScript stack: model the data before rendering it, find nodes by id, scale hit-testing with a spatial grid, reason about connectivity with union-find, test the structures, expose a semantic DOM layer for accessibility and clean up the resources you allocate.',
		from: 30,
		to: 37
	}
];

/**
 * Curriculum phases. The UI reads the label from here so that adding or moving
 * lessons only requires editing this table.
 */
export const phases = [
	{ id: 1, label: 'Phase 1: JavaScript Foundations', from: 1, to: 9 },
	{ id: 2, label: 'Phase 2: Canvas & Data Representation', from: 10, to: 16 },
	{ id: 3, label: 'Module 0.5: Tooling Bridge', from: 17, to: 20 },
	{ id: 4, label: 'Module 0.6: TypeScript Bridge', from: 21, to: 25 },
	{ id: 5, label: 'Module 0.7: Testing', from: 26, to: 27 },
	{ id: 6, label: 'Module 0.8: Lifetime & Closing', from: 28, to: 29 },
	{ id: 7, label: 'Project 1: Model, Access & Scale', from: 30, to: 34 },
	{ id: 8, label: 'Project 1: Accessibility & Memory', from: 35, to: 36 },
	{ id: 9, label: 'Project 1: Closing', from: 37, to: 37 }
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

/** Lightweight lesson index: everything the shell needs before a lesson loads. */
export const lessonList = [
	// Módulo 0 — Pixel Art Editor
	{ id: 1, title: 'Your First Pixel' },
	{ id: 2, title: 'Give the Code a Job' },
	{ id: 3, title: 'Make Decisions' },
	{ id: 4, title: 'Repeat the Work' },
	{ id: 5, title: 'Work With Collections' },
	{ id: 6, title: 'Describe Things' },
	{ id: 7, title: 'Talk to the Page' },
	{ id: 8, title: 'Listen to the User' },
	{ id: 9, title: 'Find the Limit' },
	{ id: 10, title: 'Escape the DOM' },
	{ id: 11, title: 'Where Does a Pixel Live?' },
	{ id: 12, title: 'Typed Memory' },
	{ id: 13, title: 'Fill the Area' },
	{ id: 14, title: 'Find the Recursion Limit' },
	{ id: 15, title: 'Queue It' },
	{ id: 16, title: 'Bounded History' },
	{ id: 17, title: 'Split the Code' },
	{ id: 18, title: 'The Browser Is Already a Module System' },
	{ id: 19, title: 'Build It Ourselves' },
	{ id: 20, title: 'Why Vite?' },
	{ id: 21, title: 'JavaScript Starts Fighting Back' },
	{ id: 22, title: 'Contracts Without TypeScript' },
	{ id: 23, title: 'Add Types' },
	{ id: 24, title: 'Make the Contract Useful' },
	{ id: 25, title: 'When Types Meet Reuse' },
	{ id: 26, title: 'Write Your Own Tests' },
	{ id: 27, title: 'Testing the Hard Parts' },
	{ id: 28, title: 'Memory I: Lifetime & Cleanup' },
	{ id: 29, title: 'Project Close: Definition of Done' },
	// Módulo 1 — Diagram Builder
	{ id: 30, title: 'Model Before Rendering' },
	{ id: 31, title: 'Finding Things' },
	{ id: 32, title: 'Too Many Nodes' },
	{ id: 33, title: 'Groups and Connections' },
	{ id: 34, title: 'Testing the Structures' },
	{ id: 35, title: 'The Canvas Needs a Second Representation' },
	{ id: 36, title: 'Memory Management' },
	{ id: 37, title: 'Project Close: Definition of Done' }
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
	26: () => import('./curriculum/lesson-26.js'),
	27: () => import('./curriculum/lesson-27.js'),
	28: () => import('./curriculum/lesson-28.js'),
	29: () => import('./curriculum/lesson-29.js'),
	30: () => import('./curriculum/lesson-30.js'),
	31: () => import('./curriculum/lesson-31.js'),
	32: () => import('./curriculum/lesson-32.js'),
	33: () => import('./curriculum/lesson-33.js'),
	34: () => import('./curriculum/lesson-34.js'),
	35: () => import('./curriculum/lesson-35.js'),
	36: () => import('./curriculum/lesson-36.js'),
	37: () => import('./curriculum/lesson-37.js')
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
