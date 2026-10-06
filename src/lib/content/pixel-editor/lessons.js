/**
 * Course index.
 *
 * The app hosts two independent projects ("modules"). Each one has its own
 * playground content and its own set of lessons, and each one closes with a
 * challenge lesson (`type: 'challenge'`): 80% of the structure the learner just
 * built, 20% of new reasoning.
 *
 *   Módulo 0 — Foundations Lab        · Pixel Art Editor        (lessons 1–30)
 *   Módulo 1 — Flowchart & Diagram    · Diagram Builder         (lessons 31–39)
 *
 * This module ships only lesson *metadata* (id + title + optional type) plus the
 * module and phase tables. The prose and starter code for each lesson live in
 * `./curriculum/lesson-NN.js` and are imported on demand.
 */

export const modules = [
	{
		id: 'foundations',
		label: 'Módulo 0 — Foundations Lab',
		short: 'Módulo 0 · Foundations Lab',
		project: 'Pixel Art Editor',
		stack: ['JavaScript', 'DOM', 'Canvas 2D', 'Uint8Array', 'ES Modules', 'Vite', 'TypeScript'],
		description:
			'Build the pixel editor in the DOM first, collapse it on purpose at 16,384 elements, rescue it with Canvas, and then add the data structures that make it scale: flat arrays, typed memory (Uint8Array), DFS, a BFS queue and a ring buffer for history. It closes with ES modules and a build step, TypeScript, hand-written tests, resource lifetime and a border-detection challenge.',
		from: 1,
		to: 30
	},
	{
		id: 'diagram',
		label: 'Módulo 1 — Flowchart & Diagram Builder',
		short: 'Módulo 1 · Diagram Builder',
		project: 'Diagram Builder',
		stack: ['Vite', 'TypeScript', 'Vitest', 'ESLint', 'Prettier', 'Canvas 2D', 'DOM'],
		description:
			'The same discipline on a real local toolchain: model the diagram before rendering it, find nodes by id with a Map, scale hit-testing with a spatial hash grid, query it with a proximity radar, reason about connectivity with union-find, prove the invariants with Vitest while ESLint and Prettier stay green, expose a semantic DOM layer for accessibility, release listeners with AbortController and close with a documented hit-testing benchmark.',
		from: 31,
		to: 39
	}
];

/**
 * Curriculum phases. The UI reads the label from here so that adding or moving
 * lessons only requires editing this table.
 */
export const phases = [
	{ id: 1, label: 'Phase 0.1: JavaScript Visual con el DOM', from: 1, to: 10 },
	{ id: 2, label: 'Phase 0.2: Estructuras de Datos y Algoritmos Visuales', from: 11, to: 17 },
	{ id: 3, label: 'Phase 0.5: Tooling Bridge', from: 18, to: 21 },
	{ id: 4, label: 'Phase 0.6: TypeScript Bridge', from: 22, to: 26 },
	{ id: 5, label: 'Phase 0.7: Testing Básico', from: 27, to: 28 },
	{ id: 6, label: 'Phase 0.8: Lifetime & Closing', from: 29, to: 30 },
	{ id: 7, label: 'Phase 1: Model, Access & Scale', from: 31, to: 36 },
	{ id: 8, label: 'Phase 2: Accessibility & Memory', from: 37, to: 38 },
	{ id: 9, label: 'Phase 3: Closing', from: 39, to: 39 }
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
	// Módulo 0 — Pixel Art Editor
	{ id: 1, title: 'Your First Pixel' },
	{ id: 2, title: 'Give the Code a Job' },
	{ id: 3, title: 'Make Decisions' },
	{ id: 4, title: 'Repeat the Work' },
	{ id: 5, title: 'Work With Collections' },
	{ id: 6, title: 'Describe Things' },
	{ id: 7, title: 'Talk to the Page' },
	{ id: 8, title: 'Listen to the User' },
	{ id: 9, title: 'El Límite del DOM' },
	{ id: 10, title: 'El Rescate (Canvas)' },
	{ id: 11, title: 'Where Does a Pixel Live?' },
	{ id: 12, title: 'Typed Memory' },
	{ id: 13, title: 'Fill the Area' },
	{ id: 14, title: 'Find the Recursion Limit' },
	{ id: 15, title: 'Queue It' },
	{ id: 16, title: 'El Inspector de Contornos', type: 'challenge' },
	{ id: 17, title: 'Bounded History' },
	{ id: 18, title: 'Split the Code' },
	{ id: 19, title: 'The Browser Is Already a Module System' },
	{ id: 20, title: 'El Puente de esbuild' },
	{ id: 21, title: 'Why Vite?' },
	{ id: 22, title: 'JavaScript Starts Fighting Back' },
	{ id: 23, title: 'Contracts Without TypeScript' },
	{ id: 24, title: 'Add Types' },
	{ id: 25, title: 'Make the Contract Useful' },
	{ id: 26, title: 'When Types Meet Reuse' },
	{ id: 27, title: 'Write Your Own Tests' },
	{ id: 28, title: 'Testing the Hard Parts' },
	{ id: 29, title: 'Memory I: Lifetime & Cleanup' },
	{ id: 30, title: 'Project Close: Definition of Done' },
	// Módulo 1 — Diagram Builder
	{ id: 31, title: 'Model Before Rendering' },
	{ id: 32, title: 'Finding Things' },
	{ id: 33, title: 'Too Many Nodes' },
	{ id: 34, title: 'Radar de Selecciones por Proximidad', type: 'challenge' },
	{ id: 35, title: 'Groups and Connections' },
	{ id: 36, title: 'Testing the Structures' },
	{ id: 37, title: 'The Canvas Needs a Second Representation' },
	{ id: 38, title: 'Memory Management' },
	{ id: 39, title: 'Project Close: Definition of Done' }
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
	37: () => import('./curriculum/lesson-37.js'),
	38: () => import('./curriculum/lesson-38.js'),
	39: () => import('./curriculum/lesson-39.js')
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
