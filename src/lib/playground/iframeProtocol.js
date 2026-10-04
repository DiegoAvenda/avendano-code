/**
 * Parse a postMessage event from the playground iframe.
 * Returns null if the event is not from our bridge.
 *
 * @param {MessageEvent} event
 * @returns {{ type: 'log' | 'warn' | 'error', args: string[] } | null}
 */
export function parseIframeMessage(event) {
	const data = event.data;
	if (!data || !data.__playground) return null;
	return {
		type: data.type,
		args: data.args || []
	};
}
