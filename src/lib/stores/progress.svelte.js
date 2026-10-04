/**
 * Progress store — persists lesson progress in localStorage.
 * Uses Svelte 5 runes.
 */

const STORAGE_KEY = 'frontend-data-structures-progress';

function loadProgress() {
	const fallback = {
		currentLesson: 1,
		completedLessons: [],
		editorContents: {}
	};
	try {
		if (typeof localStorage === 'undefined') return fallback;
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				currentLesson: parsed.currentLesson ?? 1,
				completedLessons: parsed.completedLessons ?? [],
				editorContents: parsed.editorContents ?? {}
			};
		}
	} catch (e) {
		// ignore parse errors
	}
	return fallback;
}

function saveProgress(data) {
	try {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (e) {
		// ignore quota errors
	}
}

/**
 * Create a progress store.
 * @returns progress store with reactive state
 */
export function createProgressStore() {
	const initial = loadProgress();

	let currentLesson = $state(initial.currentLesson);
	let completedLessons = $state(initial.completedLessons);
	let editorContents = $state(initial.editorContents);

	function persist() {
		saveProgress({
			currentLesson,
			completedLessons,
			editorContents
		});
	}

	return {
		get currentLesson() {
			return currentLesson;
		},
		set currentLesson(v) {
			currentLesson = v;
			persist();
		},
		get completedLessons() {
			return completedLessons;
		},
		markCompleted(lessonId) {
			if (!completedLessons.includes(lessonId)) {
				completedLessons = [...completedLessons, lessonId];
				persist();
			}
		},
		isCompleted(lessonId) {
			return completedLessons.includes(lessonId);
		},
		saveEditorContents(lessonId, code) {
			editorContents = { ...editorContents, [lessonId]: code };
			persist();
		},
		getEditorContents(lessonId) {
			return editorContents[lessonId] || null;
		},
		clearEditorContents(lessonId) {
			const next = { ...editorContents };
			delete next[lessonId];
			editorContents = next;
			persist();
		}
	};
}
