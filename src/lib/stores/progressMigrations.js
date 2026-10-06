/**
 * Pure migration helpers for the progress store.
 *
 * They live in a plain module (no runes, no localStorage) so the numbering rules
 * can be unit-tested. The store is responsible for persisting the result.
 *
 * History of the lesson numbering:
 *   v1 (unversioned)  lessons 1–10   the original pixel editor curriculum
 *   v2                lessons 1–19   the curriculum grew, old 1–10 → 10–19
 *   v3                lessons 1–37   Module 0 grew to 29 lessons, so the diagram
 *                                    module moved from 26–31 to 30–35
 *   v4                lessons 1–39   two challenge lessons were inserted: after
 *                                    15 (Module 0) and after 33 (Module 1)
 */

export const STORAGE_VERSION = 4;

/** In v2 the diagram module started here. */
export const MODULE_SHIFT_FROM = 26;
/** How far those lessons moved when Module 0 was extended. */
export const MODULE_SHIFT_BY = 4;

/** v4: the first challenge lands after this lesson… */
export const CHALLENGE_INSERT_AFTER = 15;
/** …and the second one after this one. */
export const SECOND_CHALLENGE_INSERT_AFTER = 32;

/**
 * Apply `mapId` to every lesson id a payload stores.
 * @param {{ currentLesson?: number, completedLessons?: number[], editorContents?: Record<string, any> }} parsed
 * @param {(id: number) => number} mapId
 */
function mapProgress(parsed, mapId) {
	const completedLessons = [
		...new Set((parsed.completedLessons ?? []).map((id) => mapId(Number(id))))
	];

	const currentLesson = mapId(parsed.currentLesson ?? 1);

	const editorContents = {};
	for (const [key, value] of Object.entries(parsed.editorContents ?? {})) {
		const lessonId = parseInt(key, 10);
		if (Number.isNaN(lessonId)) {
			editorContents[key] = value;
		} else {
			editorContents[mapId(lessonId)] = value;
		}
	}

	return { currentLesson, completedLessons, editorContents };
}

/**
 * v2 → v3: the diagram module moved from lesson 26 onwards.
 * @param {number} id
 * @returns {number}
 */
export function shiftLessonId(id) {
	return id >= MODULE_SHIFT_FROM ? id + MODULE_SHIFT_BY : id;
}

/**
 * v1 (unversioned, lessons 1–10) → v2 (lessons 10–19).
 * @param {{ currentLesson?: number, completedLessons?: number[], editorContents?: Record<string, any> }} parsed
 */
export function migrateLegacyV1(parsed) {
	const completedLessons = [
		...new Set(
			(parsed.completedLessons ?? []).map((id) => {
				const lessonId = Number(id);
				if (lessonId >= 1 && lessonId <= 10) return lessonId + 9;
				return lessonId;
			})
		)
	];

	const currentLesson = parsed.currentLesson ?? 1;
	const migratedCurrentLesson =
		currentLesson >= 1 && currentLesson <= 10 ? currentLesson + 9 : currentLesson;

	const editorContents = {};
	for (const [key, value] of Object.entries(parsed.editorContents ?? {})) {
		const lessonId = parseInt(key, 10);
		if (Number.isNaN(lessonId)) {
			editorContents[key] = value;
		} else {
			editorContents[lessonId >= 1 && lessonId <= 10 ? lessonId + 9 : lessonId] = value;
		}
	}

	return { currentLesson: migratedCurrentLesson, completedLessons, editorContents };
}

/**
 * v2 → v3: every stored lesson id from 26 onwards moves by four.
 * @param {{ currentLesson?: number, completedLessons?: number[], editorContents?: Record<string, any> }} parsed
 */
export function shiftProgressToV3(parsed) {
	return mapProgress(parsed, shiftLessonId);
}

/**
 * v3 → v4: ids 16–32 move by one, 33 and above move by two.
 * @param {{ currentLesson?: number, completedLessons?: number[], editorContents?: Record<string, any> }} parsed
 */
export function shiftProgressToV4(parsed) {
	return mapProgress(parsed, (id) => {
		if (id <= CHALLENGE_INSERT_AFTER) return id;
		if (id <= SECOND_CHALLENGE_INSERT_AFTER) return id + 1;
		return id + 2;
	});
}

/**
 * The full chain, for payloads older than the current version.
 * @param {{ currentLesson?: number, completedLessons?: number[], editorContents?: Record<string, any> }} parsed
 */
export function migrateToCurrent(parsed) {
	return shiftProgressToV4(shiftProgressToV3(parsed));
}
