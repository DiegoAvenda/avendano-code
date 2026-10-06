/**
 * Progress store — persists lesson progress in localStorage.
 * Uses Svelte 5 runes.
 *
 * The numbering rules live in ./progressMigrations.js so they can be tested
 * without a browser.
 */

import {
	STORAGE_VERSION,
	migrateLegacyV1,
	migrateToCurrent,
	shiftProgressToV4
} from './progressMigrations.js';

const STORAGE_KEY = 'frontend-data-structures-progress';
// Legacy key used before versioning was introduced.
const LEGACY_STORAGE_KEY = 'frontend-data-structures-progress-v1';

function safeParse(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/**
 * Persist a migrated payload under the current version and return it.
 * @param {{ currentLesson: number, completedLessons: number[], editorContents: Record<string, any> }} data
 */
function persistMigration(data) {
	const migrated = { version: STORAGE_VERSION, ...data };
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
	} catch {
		// ignore quota errors — keep running with in-memory data
	}
	return data;
}

/**
 * In-memory fallback used when localStorage is unavailable
 * (SSR, private mode, quota exceeded).
 */
let memoryFallback = {
	currentLesson: 1,
	completedLessons: [],
	editorContents: {}
};

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
			const parsed = safeParse(raw);
			if (!parsed) return fallback;

			// Already versioned — idempotent, no re-migration.
			if (parsed.version === STORAGE_VERSION) {
				return {
					currentLesson: parsed.currentLesson ?? 1,
					completedLessons: [...new Set(parsed.completedLessons ?? [])],
					editorContents: parsed.editorContents ?? {}
				};
			}

			// v3 → v4: two challenge lessons were inserted (after 15 and after 33).
			if (parsed.version === 3) {
				return persistMigration(shiftProgressToV4(parsed));
			}

			// v2 → v3 → v4.
			if (parsed.version === 2) {
				return persistMigration(migrateToCurrent(parsed));
			}

			// Migration v1 (unversioned, lessons 1-10) -> v2 -> v3 -> v4.
			if (!parsed.version) {
				return persistMigration(migrateToCurrent(migrateLegacyV1(parsed)));
			}

			// Unknown version — for example a payload written by a newer build.
			// Keep everything we can still read instead of silently wiping it.
			return {
				currentLesson: parsed.currentLesson ?? 1,
				completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
				editorContents:
					parsed.editorContents && typeof parsed.editorContents === 'object'
						? parsed.editorContents
						: {}
			};
		}

		// One-time check for a legacy unversioned payload stored under the old key.
		const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
		if (legacyRaw) {
			const legacy = safeParse(legacyRaw);
			if (legacy) {
				try {
					localStorage.removeItem(LEGACY_STORAGE_KEY);
				} catch {
					// ignore
				}
			}
		}
	} catch {
		// ignore parse / access errors, fall through to memory fallback
		return { ...memoryFallback };
	}
	return fallback;
}

function saveProgress(data) {
	const payload = { version: STORAGE_VERSION, ...data };
	try {
		if (typeof localStorage === 'undefined') {
			memoryFallback = { ...payload };
			return;
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// Quota / private-mode: keep an in-memory copy so the session still works.
		memoryFallback = { ...payload };
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
		unmarkCompleted(lessonId) {
			if (completedLessons.includes(lessonId)) {
				completedLessons = completedLessons.filter((id) => id !== lessonId);
				persist();
			}
		},
		toggleCompleted(lessonId) {
			if (completedLessons.includes(lessonId)) {
				completedLessons = completedLessons.filter((id) => id !== lessonId);
			} else {
				completedLessons = [...completedLessons, lessonId];
			}
			persist();
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
