// Lesson 16 — Bounded History
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 16,
	title: 'Bounded History',
	description: `Undo is the feature that makes an editor feel safe — and the feature that silently eats memory.

The simple version is a list of snapshots: copy the whole buffer after every action. It works, until you look at the numbers:

\`\`\`
32 × 32   = 1,024 bytes per snapshot → 100 snapshots = 100 KB   manageable
256 × 256 = 65,536 bytes per snapshot → 100 snapshots = 6.5 MB  not great
1024 × 1024 = 1,048,576 bytes → 100 snapshots = 100 MB          terrible
\`\`\`

Two ideas fix this:

**1. Store patches, not snapshots.** A stroke changes a handful of pixels, so record only \`{ index, previous } → new\` per pixel.

**2. Bound the list.** We want "the last 100 actions", not "all actions". A **ring buffer** keeps a fixed-size array and moves a write pointer around it with modulo arithmetic; when it wraps, the oldest entry is overwritten. Memory is bounded by construction.

The same structure answers a second question: the FPS meter only needs the last 120 frame times.`,
	task: `1. Draw a few strokes and press **Ctrl+Z** — each stroke comes back as one undo step.
2. Look at the status: \`History: n/100\`. Keep drawing past 100 strokes and watch it stop growing.
3. Read \`RingBuffer\`: \`push\`, \`pop\`, and \`forEach\` (which walks the buffer from oldest to newest).
4. Find the FPS meter in the corner. It averages the last 120 frame times using a second ring buffer.
5. Ask: why does \`push\` never need to copy or resize anything?`,
	concept: `**Ring buffer** — a fixed-size circular array with a head pointer that wraps with \`%\`. Insert and remove are O(1) and memory is bounded: new entries overwrite the oldest. Combined with **patch-based history** (storing diffs instead of full snapshots).`,
	whyItMatters: `Unbounded history leaks memory; full snapshots waste it. A ring buffer of patches gives predictable memory with O(1) push/pop — exactly what a real-time editor needs. The same pattern covers any "keep the last N things" problem: frame times, recent events, log lines, undo steps.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 16</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — bounded undo and FPS</h3>
  <div id="fps-meter">FPS: --</div>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo">↩ Undo</button>
    <span id="status">Draw | Color: 1 | History: 0/100</span>
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
#fps-meter {
  position: fixed;
  top: 12px;
  right: 12px;
  background: #161628;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: monospace;
  font-size: 12px;
  color: #2ecc71;
}
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
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
		javascript: `// Pixel Art Editor — Lesson 16: Bounded History

const WIDTH = 32;
const HEIGHT = 32;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const fpsEl = document.getElementById("fps-meter");

const PALETTE = [
  "#1a1a2e", "#e94560", "#48dbfb", "#ffd166", "#2ecc71", "#8338ec"
];

const pixels = new Uint8Array(WIDTH * HEIGHT);
const indexOf = (x, y) => y * WIDTH + x;

let selectedColor = 1;
let currentTool = "draw";

// ── Ring Buffer ──
class RingBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0;    // where the next item goes
    this.count = 0;   // how many items we currently hold
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

  // Oldest → newest
  forEach(fn) {
    if (this.count === 0) return;
    const start = (this.head - this.count + this.capacity) % this.capacity;
    for (let i = 0; i < this.count; i++) {
      fn(this.buffer[(start + i) % this.capacity], i);
    }
  }

  get size() {
    return this.count;
  }
}

// ── Undo: a bounded history of patches ──
const HISTORY_CAPACITY = 100;
const undoHistory = new RingBuffer(HISTORY_CAPACITY);
let currentStroke = [];

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
    " | Color: " + selectedColor +
    " | History: " + undoHistory.size + "/" + HISTORY_CAPACITY;
}

// ── FPS: a bounded window of frame times ──
const fpsBuffer = new RingBuffer(120);
let lastFrame = performance.now();
let dirty = true;

function updateFPS(now) {
  const delta = now - lastFrame;
  lastFrame = now;
  if (delta > 0) fpsBuffer.push(delta);
  if (fpsBuffer.size === 0) return;

  let sum = 0;
  fpsBuffer.forEach((dt) => { sum += dt; });
  fpsEl.textContent = "FPS: " + Math.round(1000 / (sum / fpsBuffer.size));
}

function loop(now) {
  updateFPS(now);
  if (dirty) {
    render();
    dirty = false;
  }
  requestAnimationFrame(loop);
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

// ── Flood fill (BFS with a head-index queue) ──
function floodFill(startX, startY, replacement) {
  const start = indexOf(startX, startY);
  const target = pixels[start];
  const patches = [];
  if (target === replacement) return patches;

  const queue = [start];
  let head = 0;
  const seen = new Uint8Array(WIDTH * HEIGHT);
  seen[start] = 1;

  while (head < queue.length) {
    const index = queue[head++];
    if (pixels[index] !== target) continue;

    patches.push({ index, previous: pixels[index] });
    pixels[index] = replacement;

    const x = index % WIDTH;
    const y = (index - x) / WIDTH;
    if (x > 0 && !seen[index - 1]) { seen[index - 1] = 1; queue.push(index - 1); }
    if (x < WIDTH - 1 && !seen[index + 1]) { seen[index + 1] = 1; queue.push(index + 1); }
    if (y > 0 && !seen[index - WIDTH]) { seen[index - WIDTH] = 1; queue.push(index - WIDTH); }
    if (y < HEIGHT - 1 && !seen[index + WIDTH]) { seen[index + WIDTH] = 1; queue.push(index + WIDTH); }
  }

  return patches;
}

// ── Undo ──
function undo() {
  const patches = undoHistory.pop();
  if (!patches) return;
  for (let i = patches.length - 1; i >= 0; i--) {
    pixels[patches[i].index] = patches[i].previous;
  }
  dirty = true;
  updateStatus();
}

document.getElementById("btn-undo").addEventListener("click", undo);
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    event.preventDefault();
    undo();
  }
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

function paint(event) {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;

  const index = indexOf(x, y);
  if (pixels[index] === selectedColor) return;

  currentStroke.push({ index, previous: pixels[index] });
  pixels[index] = selectedColor;
  dirty = true;
}

canvas.addEventListener("pointerdown", (event) => {
  const { x, y } = screenToGrid(event);
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;

  if (currentTool === "bucket") {
    const patches = floodFill(x, y, selectedColor);
    if (patches.length > 0) {
      undoHistory.push(patches);
      dirty = true;
      updateStatus();
    }
  } else {
    isDrawing = true;
    currentStroke = [];
    canvas.setPointerCapture(event.pointerId);
    paint(event);
  }
});

canvas.addEventListener("pointermove", (event) => { if (isDrawing) paint(event); });
canvas.addEventListener("pointerup", () => {
  if (isDrawing && currentStroke.length > 0) {
    undoHistory.push(currentStroke);
    currentStroke = [];
    updateStatus();
  }
  isDrawing = false;
});
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

render();
updateStatus();
requestAnimationFrame(loop);
console.log("Bounded history ready — ring buffer of patches + FPS window");`
	}
};
