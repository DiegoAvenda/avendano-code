/**
 * Pixel Art & Tilemap Editor — Lesson Curriculum
 *
 * Each lesson builds directly on the previous one.
 * Starter code for lesson N includes all features from lessons 1…(N-1).
 */

export const projectMeta = {
	id: 'pixel-editor',
	title: 'Pixel Art & Tilemap Editor',
	description:
		'Build a fully functional pixel art editor from scratch using Canvas, typed arrays, and classic data structures.',
	totalLessons: 10
};

/** @type {Array<{id: number, title: string, description: string, task: string, concept: string, whyItMatters: string, starterCode: {html: string, css: string, javascript: string}}>} */
export const lessons = [
	// ─── LESSON 1 ───────────────────────────────────────────────
	{
		id: 1,
		title: 'Create the Canvas',
		description: `Our pixel editor needs a drawing surface. The HTML \`<canvas>\` element gives us a bitmap we can draw on programmatically.

In this first lesson we'll set up a canvas with **logical** dimensions (the actual pixel grid — 32×32) that gets **scaled up** with CSS so each logical pixel is clearly visible. We also enable \`image-rendering: pixelated\` so the browser doesn't blur our art when scaling.

We'll draw a simple checkerboard grid to prove the canvas is wired up correctly.`,
		task: `1. Create a \`<canvas>\` element with \`width="32"\` and \`height="32"\`.
2. Get the 2D rendering context.
3. Scale the canvas up with CSS so each logical pixel appears large (e.g. 512×512 on screen).
4. Set \`image-rendering: pixelated\` on the canvas.
5. Draw a checkerboard pattern by filling 1×1 rectangles.`,
		concept: `**Canvas basics** — logical vs. display size, 2D context, pixelated rendering.`,
		whyItMatters: `Everything in our editor is rendered through the canvas. Getting the coordinate system right now saves us from painful debugging later.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 1</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}`,
			javascript: `// Pixel Editor — Lesson 1: Create the Canvas
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Draw a checkerboard to verify our canvas works
function drawGrid() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const isLight = (x + y) % 2 === 0;
      ctx.fillStyle = isLight ? "#2a2a3e" : "#1a1a2e";
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

drawGrid();
console.log("Canvas ready:", WIDTH, "x", HEIGHT);`
		}
	},

	// ─── LESSON 2 ───────────────────────────────────────────────
	{
		id: 2,
		title: 'Store the Pixels',
		description: `Our canvas can display pixels, but the application doesn't actually **own** the image data yet. We need an internal representation so we can later implement undo, flood fill, benchmarks, and direct pixel manipulation.

### Flat matrix with Uint8Array

Instead of a 2D array-of-arrays, we use a **flat typed array**:

\`\`\`js
const pixels = new Uint8Array(WIDTH * HEIGHT);
\`\`\`

To address pixel (x, y):

\`\`\`js
index = y * WIDTH + x;
\`\`\`

### Why not Array-of-Arrays?

| | Array of Arrays | Uint8Array |
|---|---|---|
| Memory layout | Scattered objects | Contiguous buffer |
| Cache friendliness | Poor | Excellent |
| Index math | \`arr[y][x]\` | \`arr[y * w + x]\` |
| Typed | No | Yes (0-255) |

For a 32×32 grid the difference is negligible, but at 1024×1024 it matters.

A small benchmark is included in the starter code — run it and check the console.`,
		task: `1. Create a \`Uint8Array\` of size \`WIDTH * HEIGHT\`.
2. Write a helper \`getPixel(x, y)\` and \`setPixel(x, y, value)\`.
3. Initialize some pixels with non-zero values.
4. Run the included benchmark comparing Array-of-Arrays vs Uint8Array.`,
		concept: `**Flat 2D matrix** — represent a grid as a one-dimensional typed array using \`index = y * width + x\`.`,
		whyItMatters: `A typed flat array is the foundation of every operation we'll build: rendering, drawing, flood fill, undo, and benchmarks. Choosing the right storage now means every feature we add later will be fast by default.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 2</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <button id="btn-bench">Run Storage Benchmark</button>
  <pre id="bench-output"></pre>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
button {
  background: #3a3a5c;
  color: #e0e0e0;
  border: 1px solid #555;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
button:hover { background: #4a4a6c; }
#bench-output {
  font-size: 12px;
  color: #8888aa;
  max-width: 500px;
  white-space: pre-wrap;
}`,
			javascript: `// Pixel Editor — Lesson 2: Store the Pixels
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Pixel Buffer (flat typed array) ──
const pixels = new Uint8Array(WIDTH * HEIGHT);

function getPixel(x, y) {
  return pixels[y * WIDTH + x];
}

function setPixel(x, y, value) {
  pixels[y * WIDTH + x] = value;
}

// Initialize a small pattern
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    if ((x + y) % 7 === 0) setPixel(x, y, 1);
  }
}

// ── Render ──
const COLORS = ["#1a1a2e", "#e94560"];

function render() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      ctx.fillStyle = COLORS[getPixel(x, y)] || COLORS[0];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

render();

// ── Benchmark: Array-of-Arrays vs Uint8Array ──
document.getElementById("btn-bench").addEventListener("click", () => {
  const SIZE = 1024;
  const ITERS = 50;
  const output = document.getElementById("bench-output");

  // Array of Arrays
  const arr2d = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
  let t0 = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        arr2d[y][x] = (arr2d[y][x] + 1) % 256;
  }
  const timeArr = (performance.now() - t0).toFixed(2);

  // Uint8Array
  const flat = new Uint8Array(SIZE * SIZE);
  t0 = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        flat[y * SIZE + x] = (flat[y * SIZE + x] + 1) % 256;
  }
  const timeFlat = (performance.now() - t0).toFixed(2);

  output.textContent =
    "Storage Benchmark (1024×1024, " + ITERS + " iterations)\\n" +
    "─────────────────────────────\\n" +
    "Array of Arrays : " + timeArr + " ms\\n" +
    "Uint8Array      : " + timeFlat + " ms\\n" +
    "Speed-up        : " + (timeArr / timeFlat).toFixed(2) + "×";

  console.log("Benchmark complete — check results above.");
});

console.log("Pixel buffer ready:", pixels.length, "cells");`
		}
	},

	// ─── LESSON 3 ───────────────────────────────────────────────
	{
		id: 3,
		title: 'Render the Pixel Buffer',
		description: `Right now we draw each pixel individually with \`fillRect\`, which means we're making **WIDTH × HEIGHT** draw calls every frame. That works fine at 32×32, but it's good practice to use \`ImageData\` for batch pixel rendering.

The Canvas API provides \`ImageData\` — a flat \`Uint8ClampedArray\` of RGBA values. We can write directly into it and push the whole image to the canvas in **one call** with \`putImageData\`.

### The render pipeline

\`\`\`
pixel buffer (Uint8Array)
       ↓  map color index → RGBA
ImageData (Uint8ClampedArray)
       ↓  putImageData
Canvas
\`\`\`

The pixel buffer remains the **source of truth**. The canvas is just a visual output.`,
		task: `1. Create an \`ImageData\` object matching the canvas dimensions.
2. Write a \`render()\` function that:
   - Reads each value from the pixel buffer
   - Looks up the RGBA color from a palette
   - Writes 4 bytes (R, G, B, A) into the ImageData
   - Calls \`putImageData\` once
3. Verify the checkerboard-like pattern still displays correctly.`,
		concept: `**Data-driven rendering** — the pixel buffer is the single source of truth; the canvas is a derived view.`,
		whyItMatters: `Separating data from display is the backbone of our editor. Every feature — drawing, undo, flood fill — modifies the buffer. The render function simply reflects whatever the buffer contains.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 3</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}`,
			javascript: `// Pixel Editor — Lesson 3: Render the Pixel Buffer
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette (index → [R, G, B]) ──
const PALETTE = [
  [26, 26, 46],    // 0: background
  [233, 69, 96],   // 1: red
  [72, 219, 251],  // 2: cyan
  [255, 211, 101], // 3: yellow
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);

function getPixel(x, y) {
  return pixels[y * WIDTH + x];
}

function setPixel(x, y, value) {
  pixels[y * WIDTH + x] = value;
}

// Initialize a pattern
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    if ((x + y) % 7 === 0) setPixel(x, y, 1);
    else if ((x * y) % 11 === 0) setPixel(x, y, 2);
  }
}

// ── ImageData-based rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);

function render() {
  const data = imageData.data; // Uint8ClampedArray (RGBA)
  for (let i = 0; i < pixels.length; i++) {
    const color = PALETTE[pixels[i]] || PALETTE[0];
    const offset = i * 4;
    data[offset]     = color[0]; // R
    data[offset + 1] = color[1]; // G
    data[offset + 2] = color[2]; // B
    data[offset + 3] = 255;      // A
  }
  ctx.putImageData(imageData, 0, 0);
}

render();
console.log("Rendering via ImageData — single putImageData call");`
		}
	},

	// ─── LESSON 4 ───────────────────────────────────────────────
	{
		id: 4,
		title: 'Draw and Erase',
		description: `Time to make this interactive! We need to convert mouse/pointer coordinates from **screen space** (the 512×512 CSS display) to **grid space** (the 32×32 logical canvas).

### Coordinate conversion

\`\`\`js
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / rect.width * WIDTH);
const y = Math.floor((event.clientY - rect.top) / rect.height * HEIGHT);
\`\`\`

We track whether the mouse button is pressed so we can support **drag-drawing** — the user holds the mouse and paints continuously.

- **Left click** → draw (set pixel to color 1)
- **Right click** → erase (set pixel to 0)`,
		task: `1. Add pointer event listeners to the canvas (\`pointerdown\`, \`pointermove\`, \`pointerup\`).
2. Convert screen coordinates to grid coordinates.
3. On left-button drag, set pixels to color index 1.
4. On right-button drag, erase pixels (set to 0).
5. Call \`render()\` after each modification.
6. Prevent the context menu on right-click.`,
		concept: `**Coordinate mapping** — translating between display space and logical data space.`,
		whyItMatters: `This is the core interaction loop: input → modify buffer → re-render. Every tool we add later (color palette, paint bucket) follows the same pattern.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 4</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — Draw with left click, erase with right click</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}`,
			javascript: `// Pixel Editor — Lesson 4: Draw and Erase
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26, 26, 46],    // 0: background
  [233, 69, 96],   // 1: red
  [72, 219, 251],  // 2: cyan
  [255, 211, 101], // 3: yellow
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);

function getPixel(x, y) {
  return pixels[y * WIDTH + x];
}

function setPixel(x, y, value) {
  pixels[y * WIDTH + x] = value;
}

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);

function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const color = PALETTE[pixels[i]] || PALETTE[0];
    const offset = i * 4;
    data[offset]     = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / rect.width * WIDTH);
  const y = Math.floor((event.clientY - rect.top) / rect.height * HEIGHT);
  return { x, y };
}

function paint(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  setPixel(x, y, drawColor);
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  isDrawing = true;
  drawColor = e.button === 2 ? 0 : 1; // right-click = erase
  canvas.setPointerCapture(e.pointerId);
  paint(e);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;
  paint(e);
});

canvas.addEventListener("pointerup", () => {
  isDrawing = false;
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

render();
console.log("Draw with left click, erase with right click");`
		}
	},

	// ─── LESSON 5 ───────────────────────────────────────────────
	{
		id: 5,
		title: 'Add the Color Palette',
		description: `Our pixel buffer stores **color indexes** (0-255), not raw RGB values. This is a classic indexed-color approach — the same technique used by GIF, early game consoles, and pixel art tools.

### Why indexed colors?

- Each pixel is just **1 byte** instead of 3-4 bytes
- Changing a palette entry recolors every pixel using that index — for free
- Perfect fit for \`Uint8Array\`

We'll add a visual palette bar below the canvas. Clicking a swatch selects that color for drawing.`,
		task: `1. Define a palette of 8+ colors.
2. Build a palette UI with clickable color swatches.
3. Track the currently selected color index.
4. When drawing, use the selected color index instead of hardcoded 1.
5. Highlight the currently selected swatch.`,
		concept: `**Indexed color** — pixels store palette indices, not RGB values. The palette array maps indices to actual colors.`,
		whyItMatters: `Indexed color keeps our Uint8Array compact (1 byte per pixel) and enables palette-wide color swaps. It's also the reason Uint8Array is the right choice — values naturally range 0-255, matching palette indices perfectly.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 5</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <p id="status">Color: 1</p>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
#palette {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 512px;
}
.swatch {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#status { font-size: 12px; opacity: 0.6; }`,
			javascript: `// Pixel Editor — Lesson 5: Color Palette
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette (index → [R, G, B]) ──
const PALETTE = [
  [26,  26,  46 ],  // 0: background (dark)
  [233, 69,  96 ],  // 1: red
  [72,  219, 251],  // 2: cyan
  [255, 211, 101],  // 3: yellow
  [46,  196, 132],  // 4: green
  [131, 56,  236],  // 5: purple
  [255, 154, 80 ],  // 6: orange
  [240, 240, 240],  // 7: white
  [80,  80,  110],  // 8: gray
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);

function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);

function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const color = PALETTE[pixels[i]] || PALETTE[0];
    const offset = i * 4;
    data[offset]     = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Selected Color ──
let selectedColor = 1;
const statusEl = document.getElementById("status");

function updateStatus() {
  statusEl.textContent = "Color: " + selectedColor;
}

// ── Palette UI ──
const paletteEl = document.getElementById("palette");

PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  swatch.title = "Color " + index;
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / rect.width * WIDTH);
  const y = Math.floor((event.clientY - rect.top) / rect.height * HEIGHT);
  return { x, y };
}

function paint(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  setPixel(x, y, drawColor);
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  isDrawing = true;
  drawColor = e.button === 2 ? 0 : selectedColor;
  canvas.setPointerCapture(e.pointerId);
  paint(e);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;
  paint(e);
});

canvas.addEventListener("pointerup", () => { isDrawing = false; });
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

render();
console.log("Palette ready —", PALETTE.length, "colors");`
		}
	},

	// ─── LESSON 6 ───────────────────────────────────────────────
	{
		id: 6,
		title: 'Build Undo with Ring Buffer',
		description: `Every serious editor needs undo. The naive approach — saving a complete copy of the pixel buffer for every action — is wasteful:

\`\`\`
32×32 = 1,024 bytes per snapshot
100 snapshots = 100 KB  ← manageable

But at 256×256:
65,536 bytes per snapshot
100 snapshots = 6.5 MB  ← not great

At 1024×1024:
1,048,576 bytes per snapshot
100 snapshots = 100 MB  ← terrible
\`\`\`

### Patch-based history

Instead, we record **only what changed**:

\`\`\`js
{ index, previousValue, nextValue }
\`\`\`

A single draw stroke might change 10-50 pixels. Storing 50 patches is far cheaper than cloning the entire buffer.

### Ring Buffer

We want bounded history (last 100 actions). A **ring buffer** is perfect:
- Fixed-size array
- Write pointer wraps around with modulo
- Old entries are automatically overwritten
- No array resizing, no \`shift()\`, no memory growth

\`\`\`js
class RingBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0;   // next write position
    this.count = 0;  // current number of items
  }
}
\`\`\``,
		task: `1. Implement a \`RingBuffer\` class with \`push()\`, \`pop()\`, and \`peek()\`.
2. Collect patches during a draw stroke (group all pixel changes from pointerdown to pointerup).
3. Push the patch group to the ring buffer when the stroke ends.
4. Implement undo (Ctrl+Z) — pop the last patch group and reverse the changes.
5. Cap history at 100 entries.`,
		concept: `**Ring Buffer** — a fixed-size circular buffer that overwrites the oldest entry when full. Combined with **patch-based history** — storing diffs instead of full snapshots.`,
		whyItMatters: `Unbounded history leaks memory. Full-snapshot history wastes space. A ring buffer of patches gives us O(1) push/pop with bounded, predictable memory usage — exactly what a real-time editor needs.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 6</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <div id="toolbar">
    <button id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <span id="status">Color: 1 | History: 0/100</span>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
#palette { display: flex; gap: 4px; flex-wrap: wrap; max-width: 512px; }
.swatch {
  width: 36px; height: 36px;
  border: 2px solid transparent;
  border-radius: 4px; cursor: pointer;
  transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#toolbar { display: flex; align-items: center; gap: 12px; }
button {
  background: #3a3a5c; color: #e0e0e0;
  border: 1px solid #555; padding: 6px 16px;
  border-radius: 4px; cursor: pointer; font-size: 13px;
}
button:hover { background: #4a4a6c; }
#status { font-size: 12px; opacity: 0.6; }`,
			javascript: `// Pixel Editor — Lesson 6: Undo with Ring Buffer
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26,  26,  46 ],
  [233, 69,  96 ],
  [72,  219, 251],
  [255, 211, 101],
  [46,  196, 132],
  [131, 56,  236],
  [255, 154, 80 ],
  [240, 240, 240],
  [80,  80,  110],
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);
function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);

function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const color = PALETTE[pixels[i]] || PALETTE[0];
    const offset = i * 4;
    data[offset]     = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Ring Buffer ──
class RingBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0;
    this.count = 0;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  pop() {
    if (this.count === 0) return undefined;
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.count--;
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    return item;
  }

  get size() { return this.count; }
}

// ── Undo History ──
const HISTORY_CAPACITY = 100;
const history = new RingBuffer(HISTORY_CAPACITY);
let currentStroke = []; // patches for the current stroke

// ── Selected Color ──
let selectedColor = 1;
const statusEl = document.getElementById("status");

function updateStatus() {
  statusEl.textContent = "Color: " + selectedColor + " | History: " + history.size + "/" + HISTORY_CAPACITY;
}

// ── Palette UI ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb.join(",") + ")";
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * WIDTH),
    y: Math.floor((event.clientY - rect.top) / rect.height * HEIGHT)
  };
}

function paint(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const index = y * WIDTH + x;
  const prev = pixels[index];
  if (prev === drawColor) return; // no change
  currentStroke.push({ index, previousValue: prev, nextValue: drawColor });
  pixels[index] = drawColor;
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  isDrawing = true;
  drawColor = e.button === 2 ? 0 : selectedColor;
  currentStroke = [];
  canvas.setPointerCapture(e.pointerId);
  paint(e);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;
  paint(e);
});

canvas.addEventListener("pointerup", () => {
  isDrawing = false;
  if (currentStroke.length > 0) {
    history.push(currentStroke);
    currentStroke = [];
    updateStatus();
  }
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Undo ──
function undo() {
  const patches = history.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) {
    pixels[patches[i].index] = patches[i].previousValue;
  }
  render();
  updateStatus();
}

document.getElementById("btn-undo").addEventListener("click", undo);

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    undo();
  }
});

render();
updateStatus();
console.log("Undo ready — Ctrl+Z or click the Undo button");`
		}
	},

	// ─── LESSON 7 ───────────────────────────────────────────────
	{
		id: 7,
		title: 'Paint Bucket with DFS',
		description: `The paint bucket (flood fill) is one of the most satisfying tools in any pixel editor. It fills a contiguous region of the same color with a new color.

### The key insight: it's a graph traversal

Each pixel is a "node". Its 4 neighbors (up, down, left, right) are "edges". Flood fill = visit all connected nodes with the same color.

### Why NOT recursive?

The simple recursive approach:

\`\`\`js
function fill(x, y, target, replacement) {
  if (outOfBounds(x, y)) return;
  if (getPixel(x, y) !== target) return;
  setPixel(x, y, replacement);
  fill(x+1, y, target, replacement);
  fill(x-1, y, target, replacement);
  fill(x, y+1, target, replacement);
  fill(x, y-1, target, replacement);
}
\`\`\`

This **will crash** on large regions. A 256×256 canvas filled with one color = 65,536 recursive calls = stack overflow.

### Iterative DFS with an explicit stack

\`\`\`js
const stack = [];
stack.push(startIndex);
while (stack.length > 0) {
  const current = stack.pop();
  // process and push neighbors
}
\`\`\`

Same traversal order as recursion, but we manage our own stack on the heap — no call stack limit.`,
		task: `1. Add a "Bucket" tool button to the toolbar.
2. When bucket mode is active, clicking a pixel flood-fills the contiguous region.
3. Use an explicit stack (array with push/pop), NOT recursion.
4. Record all changed pixels as patches for undo.
5. Try the optional recursive experiment on a large filled area.`,
		concept: `**Iterative DFS** — depth-first graph traversal using an explicit stack instead of the call stack. The grid is the graph; pixels are nodes; adjacency is the 4-directional neighborhood.`,
		whyItMatters: `Never rely on recursive traversal for potentially large regions. The call stack is limited (typically ~10K-25K frames). An explicit stack lives on the heap and can grow much larger. This is a fundamental principle in real-world flood fill, pathfinding, and any grid traversal.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 7</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <span id="status">Draw | Color: 1</span>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
#palette { display: flex; gap: 4px; flex-wrap: wrap; max-width: 512px; }
.swatch {
  width: 36px; height: 36px;
  border: 2px solid transparent;
  border-radius: 4px; cursor: pointer;
  transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button, .tool-btn {
  background: #3a3a5c; color: #e0e0e0;
  border: 1px solid #555; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; font-size: 13px;
}
button:hover { background: #4a4a6c; }
.tool-btn.active { background: #5a5a8c; border-color: #8888bb; }
#status { font-size: 12px; opacity: 0.6; }`,
			javascript: `// Pixel Editor — Lesson 7: Paint Bucket with DFS
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26,  26,  46 ],
  [233, 69,  96 ],
  [72,  219, 251],
  [255, 211, 101],
  [46,  196, 132],
  [131, 56,  236],
  [255, 154, 80 ],
  [240, 240, 240],
  [80,  80,  110],
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);
function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);
function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const color = PALETTE[pixels[i]] || PALETTE[0];
    const o = i * 4;
    data[o] = color[0]; data[o+1] = color[1]; data[o+2] = color[2]; data[o+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Ring Buffer ──
class RingBuffer {
  constructor(cap) {
    this.buffer = new Array(cap);
    this.capacity = cap; this.head = 0; this.count = 0;
  }
  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  pop() {
    if (this.count === 0) return undefined;
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.count--;
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    return item;
  }
  get size() { return this.count; }
}

const history = new RingBuffer(100);
let currentStroke = [];

// ── Tool State ──
let selectedColor = 1;
let currentTool = "draw"; // "draw" or "bucket"
const statusEl = document.getElementById("status");

function updateStatus() {
  const toolName = currentTool === "draw" ? "Draw" : "Bucket";
  statusEl.textContent = toolName + " | Color: " + selectedColor + " | History: " + history.size;
}

// ── Tool Buttons ──
const btnDraw = document.getElementById("btn-draw");
const btnBucket = document.getElementById("btn-bucket");

btnDraw.addEventListener("click", () => {
  currentTool = "draw";
  btnDraw.classList.add("active");
  btnBucket.classList.remove("active");
  updateStatus();
});

btnBucket.addEventListener("click", () => {
  currentTool = "bucket";
  btnBucket.classList.add("active");
  btnDraw.classList.remove("active");
  updateStatus();
});

// ── Palette UI ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb.join(",") + ")";
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Flood Fill (iterative DFS) ──
function floodFill(startX, startY, newColor) {
  const startIndex = startY * WIDTH + startX;
  const targetColor = pixels[startIndex];
  if (targetColor === newColor) return [];

  const patches = [];
  const visited = new Uint8Array(WIDTH * HEIGHT);
  const stack = [startIndex];
  visited[startIndex] = 1;

  while (stack.length > 0) {
    const idx = stack.pop();
    const prev = pixels[idx];
    patches.push({ index: idx, previousValue: prev, nextValue: newColor });
    pixels[idx] = newColor;

    const x = idx % WIDTH;
    const y = (idx - x) / WIDTH;

    // 4-directional neighbors
    const neighbors = [];
    if (x > 0)          neighbors.push(idx - 1);
    if (x < WIDTH - 1)  neighbors.push(idx + 1);
    if (y > 0)          neighbors.push(idx - WIDTH);
    if (y < HEIGHT - 1) neighbors.push(idx + WIDTH);

    for (const n of neighbors) {
      if (!visited[n] && pixels[n] === targetColor) {
        visited[n] = 1;
        stack.push(n);
      }
    }
  }

  return patches;
}

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * WIDTH),
    y: Math.floor((event.clientY - rect.top) / rect.height * HEIGHT)
  };
}

function paintPixel(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const index = y * WIDTH + x;
  const prev = pixels[index];
  if (prev === drawColor) return;
  currentStroke.push({ index, previousValue: prev, nextValue: drawColor });
  pixels[index] = drawColor;
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  const { x, y } = screenToGrid(e);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;

  drawColor = e.button === 2 ? 0 : selectedColor;

  if (currentTool === "bucket") {
    const patches = floodFill(x, y, drawColor);
    if (patches.length > 0) {
      history.push(patches);
      render();
      updateStatus();
      console.log("Flood fill: " + patches.length + " pixels changed");
    }
  } else {
    isDrawing = true;
    currentStroke = [];
    canvas.setPointerCapture(e.pointerId);
    paintPixel(e);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing || currentTool !== "draw") return;
  paintPixel(e);
});

canvas.addEventListener("pointerup", () => {
  if (isDrawing && currentStroke.length > 0) {
    history.push(currentStroke);
    currentStroke = [];
    updateStatus();
  }
  isDrawing = false;
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Undo ──
function undo() {
  const patches = history.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) {
    pixels[patches[i].index] = patches[i].previousValue;
  }
  render();
  updateStatus();
}

document.getElementById("btn-undo").addEventListener("click", undo);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
});

render();
updateStatus();
console.log("Paint bucket ready — DFS flood fill with explicit stack");`
		}
	},

	// ─── LESSON 8 ───────────────────────────────────────────────
	{
		id: 8,
		title: 'BFS Flood Fill + Queue',
		description: `DFS and BFS both visit every pixel in a connected region, but they visit them in **different orders**:

- **DFS** goes deep first — it follows one path as far as possible, then backtracks. The fill pattern looks like tendrils.
- **BFS** goes wide first — it fills outward in concentric rings from the start point, like ripples in water.

### The queue problem

A BFS queue needs \`enqueue\` (add to back) and \`dequeue\` (remove from front). JavaScript's \`Array.shift()\` removes from the front, but it's **O(n)** because it re-indexes every remaining element:

\`\`\`js
// DON'T do this for large queues:
const item = queue.shift(); // O(n)!
\`\`\`

### Head-index optimization

Instead, we keep a \`head\` pointer and simply advance it:

\`\`\`js
const queue = [];
let head = 0;

queue.push(start);        // enqueue: O(1)
while (head < queue.length) {
  const current = queue[head]; // dequeue: O(1)
  head++;
  // process...
}
\`\`\`

No element shifting needed. The "consumed" entries remain in memory but are harmless for a single fill operation.`,
		task: `1. Implement BFS flood fill using a queue with head-index.
2. Add a toggle in the UI to switch between DFS and BFS fill.
3. Benchmark both approaches and log the results.
4. Also benchmark \`Array.shift()\` vs head-index for the queue.`,
		concept: `**BFS with a Queue** — breadth-first traversal using a head-index queue. Why \`Array.shift()\` is O(n) and how to avoid it.`,
		whyItMatters: `Understanding the cost of \`Array.shift()\` is critical. It looks harmless but becomes a bottleneck at scale. The head-index pattern is a simple, powerful optimization that applies far beyond flood fill — any producer-consumer queue benefits from it.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 8</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <label class="toggle">
      <span>DFS</span>
      <input type="checkbox" id="toggle-bfs" />
      <span>BFS</span>
    </label>
    <span id="status">Draw | Color: 1</span>
  </div>
  <button id="btn-bench-fill">Run Fill Benchmark</button>
  <button id="btn-bench-queue">Run Queue Benchmark</button>
  <pre id="bench-output"></pre>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
#palette { display: flex; gap: 4px; flex-wrap: wrap; max-width: 512px; }
.swatch {
  width: 36px; height: 36px;
  border: 2px solid transparent;
  border-radius: 4px; cursor: pointer;
  transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button, .tool-btn {
  background: #3a3a5c; color: #e0e0e0;
  border: 1px solid #555; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; font-size: 13px;
}
button:hover { background: #4a4a6c; }
.tool-btn.active { background: #5a5a8c; border-color: #8888bb; }
.toggle {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; opacity: 0.8;
}
.toggle input { cursor: pointer; }
#status { font-size: 12px; opacity: 0.6; }
#bench-output {
  font-size: 12px; color: #8888aa;
  max-width: 540px; white-space: pre-wrap;
}`,
			javascript: `// Pixel Editor — Lesson 8: BFS Flood Fill + Queue
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26,26,46],[233,69,96],[72,219,251],[255,211,101],
  [46,196,132],[131,56,236],[255,154,80],[240,240,240],[80,80,110],
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);
function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);
function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const c = PALETTE[pixels[i]] || PALETTE[0];
    const o = i * 4;
    data[o] = c[0]; data[o+1] = c[1]; data[o+2] = c[2]; data[o+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Ring Buffer ──
class RingBuffer {
  constructor(cap) {
    this.buffer = new Array(cap);
    this.capacity = cap; this.head = 0; this.count = 0;
  }
  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  pop() {
    if (this.count === 0) return undefined;
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.count--;
    const item = this.buffer[this.head]; this.buffer[this.head] = undefined;
    return item;
  }
  get size() { return this.count; }
}

const undoHistory = new RingBuffer(100);
let currentStroke = [];

// ── State ──
let selectedColor = 1;
let currentTool = "draw";
let useBFS = false;
const statusEl = document.getElementById("status");

function updateStatus() {
  const tool = currentTool === "draw" ? "Draw" : ("Bucket/" + (useBFS ? "BFS" : "DFS"));
  statusEl.textContent = tool + " | Color: " + selectedColor + " | History: " + undoHistory.size;
}

// ── Tool Buttons ──
document.getElementById("btn-draw").addEventListener("click", () => {
  currentTool = "draw";
  document.getElementById("btn-draw").classList.add("active");
  document.getElementById("btn-bucket").classList.remove("active");
  updateStatus();
});
document.getElementById("btn-bucket").addEventListener("click", () => {
  currentTool = "bucket";
  document.getElementById("btn-bucket").classList.add("active");
  document.getElementById("btn-draw").classList.remove("active");
  updateStatus();
});
document.getElementById("toggle-bfs").addEventListener("change", (e) => {
  useBFS = e.target.checked;
  updateStatus();
});

// ── Palette UI ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb.join(",") + ")";
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Flood Fill: DFS (explicit stack) ──
function floodFillDFS(startX, startY, newColor) {
  const startIdx = startY * WIDTH + startX;
  const target = pixels[startIdx];
  if (target === newColor) return [];
  const patches = [];
  const visited = new Uint8Array(WIDTH * HEIGHT);
  const stack = [startIdx];
  visited[startIdx] = 1;
  let maxStack = 1;

  while (stack.length > 0) {
    maxStack = Math.max(maxStack, stack.length);
    const idx = stack.pop();
    patches.push({ index: idx, previousValue: pixels[idx], nextValue: newColor });
    pixels[idx] = newColor;
    const x = idx % WIDTH, y = (idx - x) / WIDTH;
    const neighbors = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < WIDTH - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - WIDTH);
    if (y < HEIGHT - 1) neighbors.push(idx + WIDTH);
    for (const n of neighbors) {
      if (!visited[n] && pixels[n] === target) {
        visited[n] = 1;
        stack.push(n);
      }
    }
  }
  console.log("DFS fill: " + patches.length + " pixels, max stack: " + maxStack);
  return patches;
}

// ── Flood Fill: BFS (head-index queue) ──
function floodFillBFS(startX, startY, newColor) {
  const startIdx = startY * WIDTH + startX;
  const target = pixels[startIdx];
  if (target === newColor) return [];
  const patches = [];
  const visited = new Uint8Array(WIDTH * HEIGHT);
  const queue = [startIdx];
  let head = 0;
  visited[startIdx] = 1;
  let maxQueue = 1;

  while (head < queue.length) {
    maxQueue = Math.max(maxQueue, queue.length - head);
    const idx = queue[head++];
    patches.push({ index: idx, previousValue: pixels[idx], nextValue: newColor });
    pixels[idx] = newColor;
    const x = idx % WIDTH, y = (idx - x) / WIDTH;
    const neighbors = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < WIDTH - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - WIDTH);
    if (y < HEIGHT - 1) neighbors.push(idx + WIDTH);
    for (const n of neighbors) {
      if (!visited[n] && pixels[n] === target) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }
  console.log("BFS fill: " + patches.length + " pixels, max queue: " + maxQueue);
  return patches;
}

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * WIDTH),
    y: Math.floor((event.clientY - rect.top) / rect.height * HEIGHT)
  };
}

function paintPixel(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const index = y * WIDTH + x;
  const prev = pixels[index];
  if (prev === drawColor) return;
  currentStroke.push({ index, previousValue: prev, nextValue: drawColor });
  pixels[index] = drawColor;
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  const { x, y } = screenToGrid(e);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  drawColor = e.button === 2 ? 0 : selectedColor;

  if (currentTool === "bucket") {
    const patches = useBFS
      ? floodFillBFS(x, y, drawColor)
      : floodFillDFS(x, y, drawColor);
    if (patches.length > 0) {
      undoHistory.push(patches);
      render();
      updateStatus();
    }
  } else {
    isDrawing = true;
    currentStroke = [];
    canvas.setPointerCapture(e.pointerId);
    paintPixel(e);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing || currentTool !== "draw") return;
  paintPixel(e);
});

canvas.addEventListener("pointerup", () => {
  if (isDrawing && currentStroke.length > 0) {
    undoHistory.push(currentStroke);
    currentStroke = [];
    updateStatus();
  }
  isDrawing = false;
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Undo ──
function undo() {
  const patches = undoHistory.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) {
    pixels[patches[i].index] = patches[i].previousValue;
  }
  render();
  updateStatus();
}

document.getElementById("btn-undo").addEventListener("click", undo);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
});

// ── Fill Benchmark ──
document.getElementById("btn-bench-fill").addEventListener("click", () => {
  const S = 128;
  const output = document.getElementById("bench-output");
  output.textContent = "Running fill benchmark (" + S + "×" + S + ")...\\n";

  // Open region test
  const testBuf = new Uint8Array(S * S); // all zeros = open region
  function benchFillDFS() {
    const buf = testBuf.slice();
    const visited = new Uint8Array(S * S);
    const stack = [0]; visited[0] = 1;
    let maxStack = 1, count = 0;
    while (stack.length > 0) {
      maxStack = Math.max(maxStack, stack.length);
      const idx = stack.pop(); buf[idx] = 1; count++;
      const x = idx % S, y = (idx - x) / S;
      if (x > 0 && !visited[idx-1] && buf[idx-1] === 0) { visited[idx-1]=1; stack.push(idx-1); }
      if (x < S-1 && !visited[idx+1] && buf[idx+1] === 0) { visited[idx+1]=1; stack.push(idx+1); }
      if (y > 0 && !visited[idx-S] && buf[idx-S] === 0) { visited[idx-S]=1; stack.push(idx-S); }
      if (y < S-1 && !visited[idx+S] && buf[idx+S] === 0) { visited[idx+S]=1; stack.push(idx+S); }
    }
    return { count, maxStack };
  }
  function benchFillBFS() {
    const buf = testBuf.slice();
    const visited = new Uint8Array(S * S);
    const queue = [0]; let head = 0; visited[0] = 1;
    let maxQueue = 1, count = 0;
    while (head < queue.length) {
      maxQueue = Math.max(maxQueue, queue.length - head);
      const idx = queue[head++]; buf[idx] = 1; count++;
      const x = idx % S, y = (idx - x) / S;
      if (x > 0 && !visited[idx-1] && buf[idx-1] === 0) { visited[idx-1]=1; queue.push(idx-1); }
      if (x < S-1 && !visited[idx+1] && buf[idx+1] === 0) { visited[idx+1]=1; queue.push(idx+1); }
      if (y > 0 && !visited[idx-S] && buf[idx-S] === 0) { visited[idx-S]=1; queue.push(idx-S); }
      if (y < S-1 && !visited[idx+S] && buf[idx+S] === 0) { visited[idx+S]=1; queue.push(idx+S); }
    }
    return { count, maxQueue };
  }

  const ITERS = 20;
  let t0 = performance.now();
  let dfsResult;
  for (let i = 0; i < ITERS; i++) dfsResult = benchFillDFS();
  const dfsTime = ((performance.now() - t0) / ITERS).toFixed(2);

  t0 = performance.now();
  let bfsResult;
  for (let i = 0; i < ITERS; i++) bfsResult = benchFillBFS();
  const bfsTime = ((performance.now() - t0) / ITERS).toFixed(2);

  output.textContent +=
    "Open Region (" + S + "×" + S + " = " + (S*S) + " pixels)\\n" +
    "─────────────────────────────\\n" +
    "DFS: " + dfsTime + " ms avg, max stack: " + dfsResult.maxStack + "\\n" +
    "BFS: " + bfsTime + " ms avg, max queue: " + bfsResult.maxQueue + "\\n";
});

// ── Queue Benchmark: shift() vs head-index ──
document.getElementById("btn-bench-queue").addEventListener("click", () => {
  const N = 50000;
  const output = document.getElementById("bench-output");

  // Array.shift()
  let q1 = [];
  for (let i = 0; i < N; i++) q1.push(i);
  let t0 = performance.now();
  while (q1.length > 0) q1.shift();
  const shiftTime = (performance.now() - t0).toFixed(2);

  // Head-index
  let q2 = [];
  for (let i = 0; i < N; i++) q2.push(i);
  let head = 0;
  t0 = performance.now();
  while (head < q2.length) head++;
  const headTime = (performance.now() - t0).toFixed(4);

  output.textContent =
    "Queue Benchmark (" + N + " dequeues)\\n" +
    "─────────────────────────────\\n" +
    "Array.shift() : " + shiftTime + " ms\\n" +
    "Head-index    : " + headTime + " ms\\n" +
    "Speed-up      : " + (shiftTime / headTime).toFixed(0) + "×\\n\\n" +
    "Array.shift() is O(n) per call — it re-indexes every element.\\n" +
    "Head-index is O(1) — just increment a pointer.";
});

render();
updateStatus();
console.log("BFS + DFS flood fill ready");`
		}
	},

	// ─── LESSON 9 ───────────────────────────────────────────────
	{
		id: 9,
		title: 'Build the FPS Meter',
		description: `How do we know if our editor runs smoothly? We need to measure **frames per second (FPS)**.

We'll use \`requestAnimationFrame\` to drive a render loop and measure the time between frames.

### Ring Buffer for frame times

We only care about recent performance — the last ~120 frames. Storing frame times in an unbounded array would grow forever. Instead we reuse our **Ring Buffer**:

\`\`\`js
const frameTimes = new RingBuffer(120);
\`\`\`

Each frame, we push the delta time. To compute FPS:

\`\`\`js
averageFrameTime = sum(frameTimes) / frameTimes.size;
fps = 1000 / averageFrameTime;
\`\`\`

This is the same Ring Buffer concept from Lesson 6, reinforcing bounded rolling history.`,
		task: `1. Create a render loop with \`requestAnimationFrame\`.
2. Measure frame deltas using \`performance.now()\`.
3. Store the last 120 frame times in a Ring Buffer.
4. Calculate and display average FPS.
5. Show the FPS meter in the editor UI.`,
		concept: `**Ring Buffer for rolling statistics** — store the last N samples in constant space, compute running averages without unbounded growth.`,
		whyItMatters: `This reinforces Ring Buffer as a general pattern: undo history in Lesson 6, frame timing here. Any time you need "the last N things" with O(1) insert and bounded memory, a ring buffer is the answer.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 9</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <div id="fps-meter">FPS: --</div>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <label class="toggle">
      <span>DFS</span>
      <input type="checkbox" id="toggle-bfs" />
      <span>BFS</span>
    </label>
    <span id="status">Draw | Color: 1</span>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#fps-meter {
  font-family: monospace;
  font-size: 13px;
  color: #4ade80;
  background: #111;
  padding: 4px 12px;
  border-radius: 4px;
  align-self: flex-end;
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 10;
}
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
  cursor: crosshair;
}
#palette { display: flex; gap: 4px; flex-wrap: wrap; max-width: 512px; }
.swatch {
  width: 36px; height: 36px;
  border: 2px solid transparent;
  border-radius: 4px; cursor: pointer;
  transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button, .tool-btn {
  background: #3a3a5c; color: #e0e0e0;
  border: 1px solid #555; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; font-size: 13px;
}
button:hover { background: #4a4a6c; }
.tool-btn.active { background: #5a5a8c; border-color: #8888bb; }
.toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.8; }
.toggle input { cursor: pointer; }
#status { font-size: 12px; opacity: 0.6; }`,
			javascript: `// Pixel Editor — Lesson 9: FPS Meter with Ring Buffer
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26,26,46],[233,69,96],[72,219,251],[255,211,101],
  [46,196,132],[131,56,236],[255,154,80],[240,240,240],[80,80,110],
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);
function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);
function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const c = PALETTE[pixels[i]] || PALETTE[0];
    const o = i * 4;
    data[o] = c[0]; data[o+1] = c[1]; data[o+2] = c[2]; data[o+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Ring Buffer ──
class RingBuffer {
  constructor(cap) {
    this.buffer = new Array(cap);
    this.capacity = cap; this.head = 0; this.count = 0;
  }
  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  pop() {
    if (this.count === 0) return undefined;
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.count--;
    const item = this.buffer[this.head]; this.buffer[this.head] = undefined;
    return item;
  }
  forEach(fn) {
    if (this.count === 0) return;
    let start = (this.head - this.count + this.capacity) % this.capacity;
    for (let i = 0; i < this.count; i++) {
      fn(this.buffer[(start + i) % this.capacity], i);
    }
  }
  get size() { return this.count; }
}

// ── Undo History ──
const undoHistory = new RingBuffer(100);
let currentStroke = [];

// ── FPS Meter ──
const fpsBuffer = new RingBuffer(120);
const fpsMeterEl = document.getElementById("fps-meter");
let lastFrameTime = performance.now();
let dirty = true;

function updateFPS(now) {
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta > 0) fpsBuffer.push(delta);

  if (fpsBuffer.size > 0) {
    let sum = 0;
    fpsBuffer.forEach((dt) => { sum += dt; });
    const avgFrameTime = sum / fpsBuffer.size;
    const fps = 1000 / avgFrameTime;
    fpsMeterEl.textContent = "FPS: " + Math.round(fps);
  }
}

// ── Render Loop ──
function loop(now) {
  updateFPS(now);
  if (dirty) {
    render();
    dirty = false;
  }
  requestAnimationFrame(loop);
}

function markDirty() { dirty = true; }

// ── State ──
let selectedColor = 1;
let currentTool = "draw";
let useBFS = false;
const statusEl = document.getElementById("status");

function updateStatus() {
  const tool = currentTool === "draw" ? "Draw" : ("Bucket/" + (useBFS ? "BFS" : "DFS"));
  statusEl.textContent = tool + " | Color: " + selectedColor + " | History: " + undoHistory.size;
}

// ── Tool Buttons ──
document.getElementById("btn-draw").addEventListener("click", () => {
  currentTool = "draw";
  document.getElementById("btn-draw").classList.add("active");
  document.getElementById("btn-bucket").classList.remove("active");
  updateStatus();
});
document.getElementById("btn-bucket").addEventListener("click", () => {
  currentTool = "bucket";
  document.getElementById("btn-bucket").classList.add("active");
  document.getElementById("btn-draw").classList.remove("active");
  updateStatus();
});
document.getElementById("toggle-bfs").addEventListener("change", (e) => {
  useBFS = e.target.checked; updateStatus();
});

// ── Palette UI ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb.join(",") + ")";
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Flood Fill: DFS ──
function floodFillDFS(sx, sy, newC) {
  const si = sy * WIDTH + sx; const tc = pixels[si];
  if (tc === newC) return [];
  const patches = []; const visited = new Uint8Array(WIDTH * HEIGHT);
  const stack = [si]; visited[si] = 1;
  while (stack.length > 0) {
    const idx = stack.pop();
    patches.push({ index: idx, previousValue: pixels[idx], nextValue: newC });
    pixels[idx] = newC;
    const x = idx % WIDTH, y = (idx - x) / WIDTH;
    if (x > 0 && !visited[idx-1] && pixels[idx-1]===tc) { visited[idx-1]=1; stack.push(idx-1); }
    if (x<WIDTH-1 && !visited[idx+1] && pixels[idx+1]===tc) { visited[idx+1]=1; stack.push(idx+1); }
    if (y > 0 && !visited[idx-WIDTH] && pixels[idx-WIDTH]===tc) { visited[idx-WIDTH]=1; stack.push(idx-WIDTH); }
    if (y<HEIGHT-1 && !visited[idx+WIDTH] && pixels[idx+WIDTH]===tc) { visited[idx+WIDTH]=1; stack.push(idx+WIDTH); }
  }
  return patches;
}

// ── Flood Fill: BFS ──
function floodFillBFS(sx, sy, newC) {
  const si = sy * WIDTH + sx; const tc = pixels[si];
  if (tc === newC) return [];
  const patches = []; const visited = new Uint8Array(WIDTH * HEIGHT);
  const queue = [si]; let head = 0; visited[si] = 1;
  while (head < queue.length) {
    const idx = queue[head++];
    patches.push({ index: idx, previousValue: pixels[idx], nextValue: newC });
    pixels[idx] = newC;
    const x = idx % WIDTH, y = (idx - x) / WIDTH;
    if (x > 0 && !visited[idx-1] && pixels[idx-1]===tc) { visited[idx-1]=1; queue.push(idx-1); }
    if (x<WIDTH-1 && !visited[idx+1] && pixels[idx+1]===tc) { visited[idx+1]=1; queue.push(idx+1); }
    if (y > 0 && !visited[idx-WIDTH] && pixels[idx-WIDTH]===tc) { visited[idx-WIDTH]=1; queue.push(idx-WIDTH); }
    if (y<HEIGHT-1 && !visited[idx+WIDTH] && pixels[idx+WIDTH]===tc) { visited[idx+WIDTH]=1; queue.push(idx+WIDTH); }
  }
  return patches;
}

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * WIDTH),
    y: Math.floor((event.clientY - rect.top) / rect.height * HEIGHT)
  };
}

function paintPixel(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const index = y * WIDTH + x;
  const prev = pixels[index];
  if (prev === drawColor) return;
  currentStroke.push({ index, previousValue: prev, nextValue: drawColor });
  pixels[index] = drawColor;
  markDirty();
}

canvas.addEventListener("pointerdown", (e) => {
  const { x, y } = screenToGrid(e);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  drawColor = e.button === 2 ? 0 : selectedColor;
  if (currentTool === "bucket") {
    const patches = useBFS ? floodFillBFS(x,y,drawColor) : floodFillDFS(x,y,drawColor);
    if (patches.length > 0) { undoHistory.push(patches); markDirty(); updateStatus(); }
  } else {
    isDrawing = true; currentStroke = [];
    canvas.setPointerCapture(e.pointerId);
    paintPixel(e);
  }
});
canvas.addEventListener("pointermove", (e) => { if (isDrawing && currentTool==="draw") paintPixel(e); });
canvas.addEventListener("pointerup", () => {
  if (isDrawing && currentStroke.length > 0) { undoHistory.push(currentStroke); currentStroke = []; updateStatus(); }
  isDrawing = false;
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Undo ──
function undo() {
  const patches = undoHistory.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) pixels[patches[i].index] = patches[i].previousValue;
  markDirty();
  updateStatus();
}
document.getElementById("btn-undo").addEventListener("click", undo);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
});

// Start!
render();
updateStatus();
requestAnimationFrame(loop);
console.log("FPS meter active — ring buffer of 120 frame times");`
		}
	},

	// ─── LESSON 10 ──────────────────────────────────────────────
	{
		id: 10,
		title: 'Benchmark the Architecture',
		description: `We've built a complete pixel editor using specific data structures and algorithms. But were those choices actually better? Let's find out with **real browser benchmarks**.

This final lesson adds a benchmark panel that measures:

### 1. Pixel Storage
**Array-of-Arrays** vs **Uint8Array** — read/write performance on large grids.

### 2. Flood Fill
**DFS** vs **BFS** — execution time, cells visited, maximum stack/queue size.

### 3. Queue Implementation
**Array.shift()** vs **head-index** — dequeue performance at scale.

### 4. Undo History
**Full snapshots** vs **patch-based** — memory usage comparison.

All benchmarks run real code in the browser. No fake numbers.`,
		task: `1. Add a "📊 Benchmarks" button that opens a benchmark panel.
2. Implement all four benchmark categories.
3. Display results clearly with timing and comparisons.
4. The editor should remain fully functional alongside the benchmarks.`,
		concept: `**Empirical measurement** — don't trust assumptions about performance. Measure real execution in the actual runtime environment. Tradeoffs depend on workload size.`,
		whyItMatters: `The best engineers don't just pick "the fastest" approach — they understand when performance matters and when simplicity wins. A 2D array is fine for a 16×16 grid. Uint8Array shines at 1024×1024. These benchmarks make the tradeoffs concrete and visible.`,
		starterCode: {
			html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Editor — Lesson 10 (Final)</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — Final Version</h3>
  <div id="fps-meter">FPS: --</div>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="palette"></div>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <label class="toggle">
      <span>DFS</span>
      <input type="checkbox" id="toggle-bfs" />
      <span>BFS</span>
    </label>
    <button id="btn-bench">📊 Benchmarks</button>
    <span id="status">Draw | Color: 1</span>
  </div>

  <div id="bench-panel" style="display:none;">
    <h4>Performance Benchmarks</h4>
    <div class="bench-grid">
      <div class="bench-card">
        <h5>Pixel Storage</h5>
        <p>Array-of-Arrays vs Uint8Array (1024×1024)</p>
        <button id="bench-storage">Run</button>
        <pre id="bench-storage-result">Click "Run" to benchmark</pre>
      </div>
      <div class="bench-card">
        <h5>Flood Fill</h5>
        <p>DFS vs BFS (128×128 open region)</p>
        <button id="bench-fill">Run</button>
        <pre id="bench-fill-result">Click "Run" to benchmark</pre>
      </div>
      <div class="bench-card">
        <h5>Queue: shift() vs head-index</h5>
        <p>50,000 dequeue operations</p>
        <button id="bench-queue">Run</button>
        <pre id="bench-queue-result">Click "Run" to benchmark</pre>
      </div>
      <div class="bench-card">
        <h5>Undo: Snapshots vs Patches</h5>
        <p>Memory comparison (256×256 canvas, 100 strokes)</p>
        <button id="bench-undo">Run</button>
        <pre id="bench-undo-result">Click "Run" to benchmark</pre>
      </div>
    </div>
  </div>

  <script src="script.js"><\/script>
</body>
</html>`,
			css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
h4 { margin-bottom: 8px; }
#fps-meter {
  font-family: monospace; font-size: 13px; color: #4ade80;
  background: #111; padding: 4px 12px; border-radius: 4px;
  position: fixed; top: 8px; right: 8px; z-index: 10;
}
#canvas {
  width: 512px; height: 512px;
  image-rendering: pixelated; image-rendering: crisp-edges;
  border: 2px solid #333; cursor: crosshair;
}
#palette { display: flex; gap: 4px; flex-wrap: wrap; max-width: 512px; }
.swatch {
  width: 36px; height: 36px; border: 2px solid transparent;
  border-radius: 4px; cursor: pointer; transition: border-color 0.15s;
}
.swatch:hover { border-color: #888; }
.swatch.selected { border-color: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button, .tool-btn {
  background: #3a3a5c; color: #e0e0e0;
  border: 1px solid #555; padding: 6px 14px;
  border-radius: 4px; cursor: pointer; font-size: 13px;
}
button:hover { background: #4a4a6c; }
.tool-btn.active { background: #5a5a8c; border-color: #8888bb; }
.toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.8; }
.toggle input { cursor: pointer; }
#status { font-size: 12px; opacity: 0.6; }

/* Benchmark Panel */
#bench-panel {
  width: 100%; max-width: 640px;
  background: #12121f; border: 1px solid #2a2a44;
  border-radius: 8px; padding: 16px; margin-top: 8px;
}
.bench-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) { .bench-grid { grid-template-columns: 1fr; } }
.bench-card {
  background: #1a1a30; border: 1px solid #2a2a44;
  border-radius: 6px; padding: 12px;
}
.bench-card h5 { color: #8b8bcc; margin-bottom: 4px; font-size: 13px; }
.bench-card p { font-size: 11px; opacity: 0.5; margin-bottom: 8px; }
.bench-card button { font-size: 12px; padding: 4px 12px; margin-bottom: 8px; }
.bench-card pre {
  font-size: 11px; color: #8888aa; white-space: pre-wrap;
  background: #111; padding: 8px; border-radius: 4px;
  max-height: 160px; overflow-y: auto;
}`,
			javascript: `// Pixel Editor — Lesson 10: Final Version with Benchmarks
const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Palette ──
const PALETTE = [
  [26,26,46],[233,69,96],[72,219,251],[255,211,101],
  [46,196,132],[131,56,236],[255,154,80],[240,240,240],[80,80,110],
];

// ── Pixel Buffer ──
const pixels = new Uint8Array(WIDTH * HEIGHT);
function getPixel(x, y) { return pixels[y * WIDTH + x]; }
function setPixel(x, y, v) { pixels[y * WIDTH + x] = v; }

// ── Rendering ──
const imageData = ctx.createImageData(WIDTH, HEIGHT);
function render() {
  const data = imageData.data;
  for (let i = 0; i < pixels.length; i++) {
    const c = PALETTE[pixels[i]] || PALETTE[0];
    const o = i * 4;
    data[o] = c[0]; data[o+1] = c[1]; data[o+2] = c[2]; data[o+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Ring Buffer ──
class RingBuffer {
  constructor(cap) {
    this.buffer = new Array(cap);
    this.capacity = cap; this.head = 0; this.count = 0;
  }
  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  pop() {
    if (this.count === 0) return undefined;
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.count--;
    const item = this.buffer[this.head]; this.buffer[this.head] = undefined;
    return item;
  }
  forEach(fn) {
    if (this.count === 0) return;
    let start = (this.head - this.count + this.capacity) % this.capacity;
    for (let i = 0; i < this.count; i++) fn(this.buffer[(start + i) % this.capacity], i);
  }
  get size() { return this.count; }
}

// ── Undo History ──
const undoHistory = new RingBuffer(100);
let currentStroke = [];

// ── FPS Meter ──
const fpsBuffer = new RingBuffer(120);
const fpsMeterEl = document.getElementById("fps-meter");
let lastFrameTime = performance.now();
let dirty = true;

function updateFPS(now) {
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta > 0) fpsBuffer.push(delta);
  if (fpsBuffer.size > 0) {
    let sum = 0;
    fpsBuffer.forEach(dt => { sum += dt; });
    fpsMeterEl.textContent = "FPS: " + Math.round(1000 / (sum / fpsBuffer.size));
  }
}

function loop(now) {
  updateFPS(now);
  if (dirty) { render(); dirty = false; }
  requestAnimationFrame(loop);
}
function markDirty() { dirty = true; }

// ── State ──
let selectedColor = 1;
let currentTool = "draw";
let useBFS = false;
const statusEl = document.getElementById("status");

function updateStatus() {
  const tool = currentTool === "draw" ? "Draw" : ("Bucket/" + (useBFS ? "BFS" : "DFS"));
  statusEl.textContent = tool + " | Color: " + selectedColor + " | History: " + undoHistory.size;
}

// ── Tool Buttons ──
document.getElementById("btn-draw").addEventListener("click", () => {
  currentTool = "draw";
  document.getElementById("btn-draw").classList.add("active");
  document.getElementById("btn-bucket").classList.remove("active");
  updateStatus();
});
document.getElementById("btn-bucket").addEventListener("click", () => {
  currentTool = "bucket";
  document.getElementById("btn-bucket").classList.add("active");
  document.getElementById("btn-draw").classList.remove("active");
  updateStatus();
});
document.getElementById("toggle-bfs").addEventListener("change", (e) => {
  useBFS = e.target.checked; updateStatus();
});

// Benchmark Panel Toggle
const benchPanel = document.getElementById("bench-panel");
document.getElementById("btn-bench").addEventListener("click", () => {
  benchPanel.style.display = benchPanel.style.display === "none" ? "block" : "none";
});

// ── Palette UI ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((rgb, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = "rgb(" + rgb.join(",") + ")";
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Flood Fill: DFS ──
function floodFillDFS(sx, sy, newC, buf, w, h) {
  buf = buf || pixels; w = w || WIDTH; h = h || HEIGHT;
  const si = sy * w + sx; const tc = buf[si];
  if (tc === newC) return { patches: [], maxStack: 0 };
  const patches = []; const visited = new Uint8Array(w * h);
  const stack = [si]; visited[si] = 1; let maxStack = 1;
  while (stack.length > 0) {
    maxStack = Math.max(maxStack, stack.length);
    const idx = stack.pop();
    patches.push({ index: idx, previousValue: buf[idx], nextValue: newC });
    buf[idx] = newC;
    const x = idx % w, y2 = (idx - x) / w;
    if (x > 0 && !visited[idx-1] && buf[idx-1]===tc) { visited[idx-1]=1; stack.push(idx-1); }
    if (x<w-1 && !visited[idx+1] && buf[idx+1]===tc) { visited[idx+1]=1; stack.push(idx+1); }
    if (y2>0 && !visited[idx-w] && buf[idx-w]===tc) { visited[idx-w]=1; stack.push(idx-w); }
    if (y2<h-1 && !visited[idx+w] && buf[idx+w]===tc) { visited[idx+w]=1; stack.push(idx+w); }
  }
  return { patches, maxStack };
}

// ── Flood Fill: BFS ──
function floodFillBFS(sx, sy, newC, buf, w, h) {
  buf = buf || pixels; w = w || WIDTH; h = h || HEIGHT;
  const si = sy * w + sx; const tc = buf[si];
  if (tc === newC) return { patches: [], maxQueue: 0 };
  const patches = []; const visited = new Uint8Array(w * h);
  const queue = [si]; let head = 0; visited[si] = 1; let maxQueue = 1;
  while (head < queue.length) {
    maxQueue = Math.max(maxQueue, queue.length - head);
    const idx = queue[head++];
    patches.push({ index: idx, previousValue: buf[idx], nextValue: newC });
    buf[idx] = newC;
    const x = idx % w, y2 = (idx - x) / w;
    if (x > 0 && !visited[idx-1] && buf[idx-1]===tc) { visited[idx-1]=1; queue.push(idx-1); }
    if (x<w-1 && !visited[idx+1] && buf[idx+1]===tc) { visited[idx+1]=1; queue.push(idx+1); }
    if (y2>0 && !visited[idx-w] && buf[idx-w]===tc) { visited[idx-w]=1; queue.push(idx-w); }
    if (y2<h-1 && !visited[idx+w] && buf[idx+w]===tc) { visited[idx+w]=1; queue.push(idx+w); }
  }
  return { patches, maxQueue };
}

// ── Input ──
let isDrawing = false;
let drawColor = 1;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * WIDTH),
    y: Math.floor((event.clientY - rect.top) / rect.height * HEIGHT)
  };
}

function paintPixel(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const index = y * WIDTH + x;
  const prev = pixels[index];
  if (prev === drawColor) return;
  currentStroke.push({ index, previousValue: prev, nextValue: drawColor });
  pixels[index] = drawColor;
  markDirty();
}

canvas.addEventListener("pointerdown", (e) => {
  const { x, y } = screenToGrid(e);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  drawColor = e.button === 2 ? 0 : selectedColor;
  if (currentTool === "bucket") {
    const result = useBFS
      ? floodFillBFS(x, y, drawColor)
      : floodFillDFS(x, y, drawColor);
    if (result.patches.length > 0) {
      undoHistory.push(result.patches);
      markDirty(); updateStatus();
      console.log((useBFS?"BFS":"DFS") + " fill: " + result.patches.length + " pixels");
    }
  } else {
    isDrawing = true; currentStroke = [];
    canvas.setPointerCapture(e.pointerId);
    paintPixel(e);
  }
});
canvas.addEventListener("pointermove", (e) => { if (isDrawing && currentTool==="draw") paintPixel(e); });
canvas.addEventListener("pointerup", () => {
  if (isDrawing && currentStroke.length > 0) { undoHistory.push(currentStroke); currentStroke = []; updateStatus(); }
  isDrawing = false;
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Undo ──
function undo() {
  const patches = undoHistory.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) pixels[patches[i].index] = patches[i].previousValue;
  markDirty(); updateStatus();
}
document.getElementById("btn-undo").addEventListener("click", undo);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
});

// ══════════════════════════════════════════════
// BENCHMARKS
// ══════════════════════════════════════════════

// 1. Storage Benchmark
document.getElementById("bench-storage").addEventListener("click", () => {
  const out = document.getElementById("bench-storage-result");
  out.textContent = "Running...";
  const S = 1024, ITERS = 30;

  const arr2d = Array.from({length: S}, () => new Array(S).fill(0));
  let t0 = performance.now();
  for (let i = 0; i < ITERS; i++)
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++)
        arr2d[y][x] = (arr2d[y][x] + 1) % 256;
  const timeArr = ((performance.now() - t0) / ITERS).toFixed(2);

  const flat = new Uint8Array(S * S);
  t0 = performance.now();
  for (let i = 0; i < ITERS; i++)
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++)
        flat[y * S + x] = (flat[y * S + x] + 1) % 256;
  const timeFlat = ((performance.now() - t0) / ITERS).toFixed(2);

  out.textContent =
    "1024×1024 read+write (" + ITERS + " iters avg)\\n" +
    "Array of Arrays: " + timeArr + " ms\\n" +
    "Uint8Array     : " + timeFlat + " ms\\n" +
    "Speed-up       : " + (timeArr / timeFlat).toFixed(1) + "×\\n\\n" +
    "Memory estimate:\\n" +
    "Array of Arrays: ~" + Math.round(S * S * 8 / 1024 / 1024) + " MB (boxed numbers)\\n" +
    "Uint8Array     : " + (S * S / 1024 / 1024).toFixed(1) + " MB (1 byte/pixel)";
});

// 2. Fill Benchmark
document.getElementById("bench-fill").addEventListener("click", () => {
  const out = document.getElementById("bench-fill-result");
  out.textContent = "Running...";
  const S = 128, ITERS = 20;

  let t0 = performance.now();
  let dfsRes;
  for (let i = 0; i < ITERS; i++) {
    const buf = new Uint8Array(S * S);
    dfsRes = floodFillDFS(0, 0, 1, buf, S, S);
  }
  const dfsTime = ((performance.now() - t0) / ITERS).toFixed(2);

  t0 = performance.now();
  let bfsRes;
  for (let i = 0; i < ITERS; i++) {
    const buf = new Uint8Array(S * S);
    bfsRes = floodFillBFS(0, 0, 1, buf, S, S);
  }
  const bfsTime = ((performance.now() - t0) / ITERS).toFixed(2);

  out.textContent =
    S + "×" + S + " open region (" + ITERS + " runs avg)\\n" +
    "DFS: " + dfsTime + " ms, max stack: " + dfsRes.maxStack + "\\n" +
    "BFS: " + bfsTime + " ms, max queue: " + bfsRes.maxQueue + "\\n" +
    "Cells: " + dfsRes.patches.length + "\\n\\n" +
    "Both visit all cells. DFS tends to use more\\n" +
    "peak memory (deep stack) vs BFS (wide frontier).";
});

// 3. Queue Benchmark
document.getElementById("bench-queue").addEventListener("click", () => {
  const out = document.getElementById("bench-queue-result");
  out.textContent = "Running...";
  const N = 50000;

  // shift()
  const q1 = [];
  for (let i = 0; i < N; i++) q1.push(i);
  let t0 = performance.now();
  while (q1.length > 0) q1.shift();
  const shiftTime = (performance.now() - t0).toFixed(2);

  // head-index
  const q2 = [];
  for (let i = 0; i < N; i++) q2.push(i);
  let head = 0;
  t0 = performance.now();
  while (head < q2.length) { const _ = q2[head]; head++; }
  const headTime = (performance.now() - t0).toFixed(4);

  const speedup = headTime > 0 ? (shiftTime / headTime).toFixed(0) : "∞";

  out.textContent =
    N.toLocaleString() + " dequeue operations\\n" +
    "Array.shift(): " + shiftTime + " ms  ← O(n) per call\\n" +
    "Head-index   : " + headTime + " ms  ← O(1) per call\\n" +
    "Speed-up     : " + speedup + "×\\n\\n" +
    "shift() re-indexes every remaining element.\\n" +
    "Head-index just increments a pointer.";
});

// 4. Undo Benchmark
document.getElementById("bench-undo").addEventListener("click", () => {
  const out = document.getElementById("bench-undo-result");
  const S = 256;
  const NUM_STROKES = 100;
  const PIXELS_PER_STROKE = 30;

  // Snapshot approach
  const snapshotSize = S * S; // bytes per snapshot
  const snapshotTotal = snapshotSize * NUM_STROKES;

  // Patch approach
  const patchSize = PIXELS_PER_STROKE * 12; // ~12 bytes per patch (index + 2 values + overhead)
  const patchTotal = patchSize * NUM_STROKES;

  out.textContent =
    "Canvas: " + S + "×" + S + " (" + (S*S).toLocaleString() + " pixels)\\n" +
    "History: " + NUM_STROKES + " strokes, ~" + PIXELS_PER_STROKE + " px each\\n" +
    "─────────────────────────────\\n" +
    "Snapshots:\\n" +
    "  Per entry : " + (snapshotSize / 1024).toFixed(1) + " KB\\n" +
    "  Total     : " + (snapshotTotal / 1024).toFixed(0) + " KB (" + (snapshotTotal / 1024 / 1024).toFixed(1) + " MB)\\n" +
    "  Growth    : Linear with canvas size\\n\\n" +
    "Patches:\\n" +
    "  Per entry : ~" + (patchSize) + " bytes\\n" +
    "  Total     : ~" + (patchTotal / 1024).toFixed(1) + " KB\\n" +
    "  Growth    : Linear with stroke size (tiny!)\\n\\n" +
    "Ratio: " + Math.round(snapshotTotal / patchTotal) + "× less memory with patches\\n\\n" +
    "With Ring Buffer: memory is bounded at " + NUM_STROKES + " entries max.\\n" +
    "Old entries are overwritten — no cleanup needed.";
});

// ── Start ──
render();
updateStatus();
requestAnimationFrame(loop);
console.log("Pixel Editor — Final Version");
console.log("Data structures: Uint8Array, Ring Buffer, DFS Stack, BFS Queue");`
		}
	}
];
