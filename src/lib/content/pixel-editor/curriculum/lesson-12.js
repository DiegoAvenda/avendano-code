// Pixel Art Editor — Lesson 12: Typed Memory
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 12,
	title: 'Typed Memory',
	description: `Our flat array works, but look at what it stores: a pixel value is a small number, and a grid of 32 × 32 is only 1,024 of them. A regular JavaScript array is a general-purpose container — it can hold anything, and it pays for that flexibility.

The values we store are small and predictable: **0 to 255**. That is exactly what a byte can hold, and the platform gives us a container built for it:

\`\`\`
const pixels = new Uint8Array(WIDTH * HEIGHT);
\`\`\`

The values are **palette indexes**, not colors. Index 0 might be the background, index 1 red, index 2 cyan… One byte per pixel, and the palette maps the byte to a real color.`,
	task: `1. Compare \`arrayBuffer\` (a normal Array) with \`pixels\` (a Uint8Array).
2. Look at how \`render()\` turns an index into a color through \`PALETTE\`.
3. Press **Benchmark** to time the same write/read loop on both containers.
4. Read the memory estimate in the report — the difference is bytes per value, not speed of one operation.
5. Click the canvas to paint pixels and watch the buffer change.`,
	concept: `**Typed arrays** — fixed-size containers with a known numeric type (\`Uint8Array\` = one unsigned byte per element), so memory is compact, linear and predictable.`,
	whyItMatters: `\`Uint8Array\` is not here because it is "advanced". It is here because it is the right *representation* for the data we have: small, bounded, numeric values in a fixed grid. Values that fit naturally in 0–255 also match palette indexes perfectly.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 12</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — one byte per pixel</h3>
  <div id="controls">
    <button id="bench-btn">Benchmark</button>
    <span id="selected">Color: 1</span>
  </div>
  <canvas id="canvas" width="32" height="32"></canvas>
  <p id="report">Left-click to paint. Index 1 is red.</p>
  <script src="script.js"></script>
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
#controls { display: flex; align-items: center; gap: 12px; }
#selected { color: #8888aa; font-size: 13px; }
#bench-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#bench-btn:hover { border-color: #8b8bcc; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #3a3a5c;
  cursor: crosshair;
}
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
  min-height: 40px;
}`,
		javascript: `// Pixel Art Editor — Lesson 12: Typed Memory

const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reportEl = document.getElementById("report");

// Index → color. Values in the buffer are palette indexes, not colors.
const PALETTE = [
  "#1a1a2e", // 0 background
  "#e94560", // 1 red
  "#48dbfb", // 2 cyan
  "#ffd166", // 3 yellow
  "#2ecc71"  // 4 green
];

// ── One byte per pixel ──
const pixels = new Uint8Array(WIDTH * HEIGHT);

// The same values in a general-purpose array, for comparison
const arrayBuffer = new Array(WIDTH * HEIGHT).fill(0);

const indexOf = (x, y) => y * WIDTH + x;

let selected = 1;
const selectedEl = document.getElementById("selected");

function render() {
  const image = ctx.createImageData(WIDTH, HEIGHT);
  const data = image.data;

  for (let i = 0; i < pixels.length; i++) {
    const hex = PALETTE[pixels[i]] || PALETTE[0];
    const o = i * 4;
    data[o] = parseInt(hex.slice(1, 3), 16);
    data[o + 1] = parseInt(hex.slice(3, 5), 16);
    data[o + 2] = parseInt(hex.slice(5, 7), 16);
    data[o + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
}

// ── Painting ──
let isDrawing = false;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(((event.clientX - rect.left) / rect.width) * WIDTH),
    y: Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT)
  };
}

function paint(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  pixels[indexOf(x, y)] = selected;
  render();
}

canvas.addEventListener("pointerdown", (event) => {
  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);
  paint(event);
});
canvas.addEventListener("pointermove", (event) => { if (isDrawing) paint(event); });
canvas.addEventListener("pointerup", () => { isDrawing = false; });
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

// ── The cost of flexibility ──
document.getElementById("bench-btn").addEventListener("click", () => {
  const ITERS = 500;

  let start = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let j = 0; j < pixels.length; j++) pixels[j] = (pixels[j] + 1) % 256;
  }
  const typedMs = performance.now() - start;

  start = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let j = 0; j < arrayBuffer.length; j++) arrayBuffer[j] = (arrayBuffer[j] + 1) % 256;
  }
  const arrayMs = performance.now() - start;

  const bytes = pixels.length;
  reportEl.textContent =
    "Writes × " + ITERS + " on " + bytes.toLocaleString() + " values\\n" +
    "Uint8Array : " + typedMs.toFixed(1) + " ms · " + bytes.toLocaleString() + " bytes\\n" +
    "Array      : " + arrayMs.toFixed(1) + " ms · at least " + (bytes * 8).toLocaleString() + " bytes";

  console.log("Uint8Array", typedMs.toFixed(1), "ms · Array", arrayMs.toFixed(1), "ms");
});

selectedEl.textContent = "Color: " + selected;
render();
console.log("Pixel buffer ready:", pixels.length, "bytes");`
	}
};
