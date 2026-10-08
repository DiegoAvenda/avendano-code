<script>
	/**
	 * Draggable separator between two workspace panels.
	 *
	 * The component is value based: the parent owns the size and receives a new
	 * one through `onchange`. Drag, touch (Pointer Events + pointer capture),
	 * keyboard arrows and double-click-to-reset all funnel into that callback.
	 *
	 * @type {{
	 *   orientation?: 'vertical' | 'horizontal',
	 *   value: number,
	 *   min: number,
	 *   max: number,
	 *   step?: number,
	 *   invert?: boolean,
	 *   label: string,
	 *   onchange: (value: number) => void,
	 *   onreset?: () => void
	 * }}
	 */
	let {
		orientation = 'vertical',
		value,
		min,
		max,
		step = 16,
		invert = false,
		label,
		onchange,
		onreset
	} = $props();

	let dragging = $state(false);
	let startPointer = 0;
	let startValue = 0;

	const horizontal = $derived(orientation === 'horizontal');
	// A separator pinned to the far edge of its panel (the console) grows the
	// panel when the pointer moves towards the start of the axis.
	const sign = $derived(invert ? -1 : 1);

	/** @param {number} next */
	function clamp(next) {
		return Math.min(max, Math.max(min, Math.round(next)));
	}

	// A pointer capture routes every move to this element, but the browser would
	// still select text under the cursor, so the whole document opts out.
	$effect(() => {
		if (!dragging) return;
		const { style } = document.body;
		const previous = style.userSelect;
		style.userSelect = 'none';
		return () => {
			style.userSelect = previous;
		};
	});

	/** @param {PointerEvent} event */
	function handlePointerDown(event) {
		if (event.button !== 0) return;
		dragging = true;
		startPointer = horizontal ? event.clientY : event.clientX;
		startValue = value;
		event.currentTarget.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	/** @param {PointerEvent} event */
	function handlePointerMove(event) {
		if (!dragging) return;
		const pointer = horizontal ? event.clientY : event.clientX;
		onchange?.(clamp(startValue + sign * (pointer - startPointer)));
	}

	/** @param {PointerEvent} event */
	function handlePointerUp(event) {
		if (!dragging) return;
		dragging = false;
		if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	/** @param {KeyboardEvent} event */
	function handleKeydown(event) {
		const towardStart = horizontal ? 'ArrowUp' : 'ArrowLeft';
		const towardEnd = horizontal ? 'ArrowDown' : 'ArrowRight';
		// Inverted separators sit after their panel, so the axis is flipped.
		const decrease = invert ? towardEnd : towardStart;
		const increase = invert ? towardStart : towardEnd;

		if (event.key === decrease) onchange?.(clamp(value - step));
		else if (event.key === increase) onchange?.(clamp(value + step));
		else if (event.key === 'Home') onchange?.(clamp(min));
		else if (event.key === 'End') onchange?.(clamp(max));
		else if (event.key === 'Enter' || event.key === ' ') onreset?.();
		else return;

		event.preventDefault();
	}
</script>

<!--
	A "window splitter" is a focusable separator: it owns arrow-key resizing, so
	it is interactive by design. The compiler only sees the separator role, hence
	the two explicit a11y opt-outs below.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	class="lab-splitter"
	data-orientation={orientation}
	data-dragging={dragging}
	role="separator"
	aria-orientation={orientation}
	aria-label={label}
	aria-valuenow={Math.round(value)}
	aria-valuemin={min}
	aria-valuemax={max}
	tabindex="0"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	ondblclick={() => onreset?.()}
	onkeydown={handleKeydown}
></div>
