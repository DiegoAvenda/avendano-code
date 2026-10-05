import { redirect } from '@sveltejs/kit';

import { lessonList } from '#lib/content/pixel-editor/lessons.js';

/**
 * Validate the lesson id in the URL before the page renders, so `/lesson/999`
 * never reaches the player and unknown ids fall back to the home page.
 */
export function load({ params }) {
	const id = Number(params.id);

	if (!Number.isInteger(id) || id < 1 || id > lessonList.length) {
		redirect(307, '/');
	}

	return { id };
}
