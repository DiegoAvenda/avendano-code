/**
 * Layout preferences for the lesson workspace (column widths, console height,
 * preview mode).
 *
 * Deliberately separate from the progress store: the workspace layout is a
 * throwaway convenience, while progress is a learner's work. Keeping the two
 * apart means a corrupt layout payload can never touch progress, and vice
 * versa. Everything read here is sanitised, so a hand-edited localStorage
 * entry cannot put the workspace into an unusable state.
 */

export const LAB_LAYOUT_KEY = 'frontend-lab-layout';

/** Bounds shared by the splitters and the sanitiser. */
export const LESSON_WIDTH = { min: 240, max: 640, fallback: 320 };
export const EDITOR_WIDTH = { min: 320, max: 2600, fallback: null };
export const CONSOLE_HEIGHT = { min: 120, max: 560, fallback: 220 };
/** Height of the collapsed console: just its header row. */
export const CONSOLE_COLLAPSED_HEIGHT = 32;

export const LAB_LAYOUT_DEFAULTS = {
	/** Lesson column width in px. */
	lessonW: LESSON_WIDTH.fallback,
	/** Editor column width in px, or null for the default grid ratio. */
	editorW: EDITOR_WIDTH.fallback,
	/** Height of the console when it is open, in px. */
	consoleH: CONSOLE_HEIGHT.fallback,
	/** Keep the console open while running code. */
	consolePinned: false,
	/** Preview fills the panel by scaling the lesson down (true) or scrolls (false). */
	fitPreview: true
};

/**
 * @param {unknown} value
 * @param {{ min: number, max: number }} bounds
 * @param {number | null} fallback
 * @returns {number | null}
 */
function clampSize(value, bounds, fallback) {
	if (fallback === null && value === null) return null;
	if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
	return Math.min(bounds.max, Math.max(bounds.min, Math.round(value)));
}

/**
 * Turn anything that came out of localStorage into a usable layout object.
 * Missing, partial or corrupt input all fall back to the defaults.
 *
 * @param {unknown} raw
 * @returns {typeof LAB_LAYOUT_DEFAULTS}
 */
export function parseLabLayout(raw) {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return { ...LAB_LAYOUT_DEFAULTS };
	}

	const source = /** @type {Record<string, unknown>} */ (raw);

	return {
		lessonW: clampSize(source.lessonW, LESSON_WIDTH, LAB_LAYOUT_DEFAULTS.lessonW),
		editorW: clampSize(source.editorW, EDITOR_WIDTH, LAB_LAYOUT_DEFAULTS.editorW),
		consoleH: clampSize(source.consoleH, CONSOLE_HEIGHT, LAB_LAYOUT_DEFAULTS.consoleH),
		consolePinned: source.consolePinned === true,
		fitPreview: source.fitPreview !== false
	};
}

/**
 * @param {Pick<Storage, 'getItem'> | undefined} [storage]
 * @returns {typeof LAB_LAYOUT_DEFAULTS}
 */
export function loadLabLayout(storage = globalThis.localStorage) {
	if (!storage) return { ...LAB_LAYOUT_DEFAULTS };

	try {
		const stored = storage.getItem(LAB_LAYOUT_KEY);
		return parseLabLayout(stored ? JSON.parse(stored) : null);
	} catch {
		// Unreadable or malformed JSON: keep the defaults.
		return { ...LAB_LAYOUT_DEFAULTS };
	}
}

/**
 * @param {Partial<typeof LAB_LAYOUT_DEFAULTS>} layout
 * @param {Pick<Storage, 'setItem'> | undefined} [storage]
 */
export function saveLabLayout(layout, storage = globalThis.localStorage) {
	if (!storage) return;

	try {
		storage.setItem(LAB_LAYOUT_KEY, JSON.stringify(parseLabLayout(layout)));
	} catch {
		// Storage full or blocked (private mode): the layout is not worth failing over.
	}
}
