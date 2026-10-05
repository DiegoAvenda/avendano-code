// Lesson 13 — Fill the Area
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 13,
	title: 'Fill the Area',
	description: `Painting one pixel at a time is not enough for a real editor. The paint bucket has to fill a whole contiguous region — everything reachable from the pixel you clicked, walking only up, down, left and right.

The natural description of that job is recursive:

\`\`\`
fill(x, y):
  if the pixel is not the target color: stop
  paint it
  fill(x + 1, y)
  fill(x - 1, y)
  fill(x, y + 1)
  fill(x, y - 1)
\`\`\`

The "stop" line is the **base case**. Without it, the fill would never end.`,
	task: `1. Paint a few red walls on the canvas, then switch to the bucket and click inside a region.
2. Read \`floodFill\` and find its base case — the line that stops the recursion.
3. Watch the console: it reports how many pixels the fill visited.
4. Click **Undo** to reverse the whole fill.
5. Change the canvas to 64 × 64 and fill a large empty area. Keep the result in mind for the next lesson.`,
	concept: `**Recursive DFS (depth-first search)** — the grid is a graph, each pixel is a node and its 4 neighbours are edges. Recursion explores one direction as deep as it can before backing up.`,
	whyItMatters: `This is the shape of a huge family of problems (regions, islands, paths). The recursive version is the clearest way to express it — and it also has a limit that we are about to hit on purpose.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 13</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — paint bucket (recursive DFS)</h3>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket" class="tool-btn">🪣 Bucket</button>
    <button id="btn-undo">↩ Undo</button>
    <span id="status">Draw | Color: 1</span>
  </div>
  <div id="palette"></div>
  <canvas id="canvas" width="32" height="32"></canvas>
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
#toolbar { display: flex; align-items: center; gap: 8px; }
.tool-btn, #btn-undo {
  background: #2a2a44;
  color: #c0c0d8;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.tool-btn.active { background: #8b8bcc; border-color: #8b8bcc; color: #161628; }
#status { color: #8888aa; font-size: 12px; }
#palette { display: flex; gap: 6px; }
.swatch {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 2px solid transparent;
  cursor: pointer;
}
.swatch.selected { border-color: #ffffff; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #3a3a5c;
  cursor: crosshair;
}`,
		javascript: `// Pixel Art Editor — Lesson 13: Fill the Area

const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");

const PALETTE = [
  "#1a1a2e", "#e94560", "#48dbfb", "#ffd166", "#2ecc71", "#8338ec"
];

const pixels = new Uint8Array(WIDTH * HEIGHT);
const indexOf = (x, y) => y * WIDTH + x;

let selectedColor = 1;
let currentTool = "draw";

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

function updateStatus() {
  statusEl.textContent =
    (currentTool === "draw" ? "Draw" : "Bucket") +
    " | Color: " + selectedColor + " | History: " + history.length;
}

// ── Toolbar ──
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

// ── Palette ──
const paletteEl = document.getElementById("palette");
PALETTE.forEach((hex, index) => {
  const swatch = document.createElement("div");
  swatch.className = "swatch" + (index === selectedColor ? " selected" : "");
  swatch.style.background = hex;
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
    swatch.classList.add("selected");
    selectedColor = index;
    updateStatus();
  });
  paletteEl.appendChild(swatch);
});

// ── Flood fill: recursive DFS ──
let visited = 0;

function floodFill(x, y, target, replacement) {
  // Base cases: outside the grid, wrong color, or already the new color.
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  if (pixels[indexOf(x, y)] !== target) return;
  if (target === replacement) return;

  pixels[indexOf(x, y)] = replacement;
  visited++;

  floodFill(x + 1, y, target, replacement);
  floodFill(x - 1, y, target, replacement);
  floodFill(x, y + 1, target, replacement);
  floodFill(x, y - 1, target, replacement);
}

// ── History (simple snapshots for now) ──
const history = [];

function snapshot() {
  history.push(pixels.slice());
}

document.getElementById("btn-undo").addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  pixels.set(previous);
  render();
  updateStatus();
});

// ── Input ──
let isDrawing = false;

function screenToGrid(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(((event.clientX - rect.left) / rect.width) * WIDTH),
    y: Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT)
  };
}

canvas.addEventListener("pointerdown", (event) => {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;

  if (currentTool === "bucket") {
    snapshot();
    visited = 0;
    floodFill(x, y, pixels[indexOf(x, y)], selectedColor);
    render();
    updateStatus();
    console.log("Flood fill visited", visited, "pixels");
  } else {
    snapshot();
    isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    pixels[indexOf(x, y)] = selectedColor;
    render();
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDrawing) return;
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  pixels[indexOf(x, y)] = selectedColor;
  render();
});

canvas.addEventListener("pointerup", () => { isDrawing = false; });
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

render();
updateStatus();
console.log("Paint bucket ready — recursive DFS");`
	}
};
