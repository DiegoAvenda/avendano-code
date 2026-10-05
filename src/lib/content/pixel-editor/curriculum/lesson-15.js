// Lesson 15 — Queue It
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 15,
	title: 'Queue It',
	description: `The recursive fill taught us where the limit comes from: the pending work is stored in the **call stack**. If we want a fill that scales, we have to store the pending work somewhere we control — on the heap, in a data structure.

A **queue** is the natural fit: when we visit a pixel we push its neighbours at the end, and we always take the next pixel from the front. First in, first out:

\`\`\`
queue: [ start ]
  take from the front → paint → push its 4 neighbours
  take from the front → paint → push its 4 neighbours
  …
until the queue is empty
\`\`\`

That is **breadth-first search**: it fills outward in rings around the start point, and the traversal order is completely different from DFS — the *result* is the same region.

One detail matters for performance: \`Array.shift()\` removes from the front but re-indexes every remaining element, so it is O(n) per call. Instead we keep a **head index** and simply advance it.`,
	task: `1. Switch to the bucket and fill a region — it now uses the queue, not recursion.
2. Try filling a large empty area: no stack limit, because the work lives in the queue.
3. Press **Benchmark** to compare \`Array.shift()\` with the head-index pattern.
4. Read the two log lines in the console: DFS and BFS visit the same pixels in a different order.
5. Flip the DFS/BFS toggle and fill the same region twice. Watch the order in which pixels change.`,
	concept: `**BFS with a queue** — pending work stored in an explicit FIFO structure instead of the call stack, plus the head-index pattern to make "take from the front" O(1).`,
	whyItMatters: `This is the general answer to last lesson's question: when the amount of pending work is not bounded, move it out of the call stack. The same idea shows up in pathfinding, scheduling, streaming and any producer/consumer pipeline — and knowing the cost of \`shift()\` keeps it fast.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 15</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — BFS flood fill with a queue</h3>
  <div id="toolbar">
    <button id="btn-draw" class="tool-btn active">✏️ Draw</button>
    <button id="btn-bucket">🪣 Bucket</button>
    <button id="btn-undo">↩ Undo</button>
    <label id="algo-toggle"><input type="checkbox" id="toggle-bfs" checked /> BFS</label>
    <span id="status">Draw | Color: 1</span>
  </div>
  <div id="palette"></div>
  <button id="bench-btn">Benchmark shift() vs head-index</button>
  <canvas id="canvas" width="64" height="64"></canvas>
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
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.tool-btn, #btn-undo, #bench-btn {
  background: #2a2a44;
  color: #c0c0d8;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.tool-btn.active { background: #8b8bcc; border-color: #8b8bcc; color: #161628; }
#algo-toggle { color: #8888aa; font-size: 13px; display: flex; align-items: center; gap: 4px; }
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
		javascript: `// Pixel Art Editor — Lesson 15: Queue It

const WIDTH = 64;
const HEIGHT = 64;

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
let useBFS = true;
const history = [];

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
    (currentTool === "draw" ? "Draw" : "Bucket/" + (useBFS ? "BFS" : "DFS")) +
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
document.getElementById("toggle-bfs").addEventListener("change", (event) => {
  useBFS = event.target.checked;
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

// ── DFS with an explicit stack (from the previous lesson) ──
function floodFillDFS(startX, startY, replacement) {
  const start = indexOf(startX, startY);
  const target = pixels[start];
  if (target === replacement) return 0;

  const stack = [start];
  const seen = new Uint8Array(WIDTH * HEIGHT);
  seen[start] = 1;
  let count = 0;

  while (stack.length > 0) {
    const index = stack.pop();
    if (pixels[index] !== target) continue;
    pixels[index] = replacement;
    count++;

    const x = index % WIDTH;
    const y = (index - x) / WIDTH;
    if (x > 0 && !seen[index - 1]) { seen[index - 1] = 1; stack.push(index - 1); }
    if (x < WIDTH - 1 && !seen[index + 1]) { seen[index + 1] = 1; stack.push(index + 1); }
    if (y > 0 && !seen[index - WIDTH]) { seen[index - WIDTH] = 1; stack.push(index - WIDTH); }
    if (y < HEIGHT - 1 && !seen[index + WIDTH]) { seen[index + WIDTH] = 1; stack.push(index + WIDTH); }
  }

  return count;
}

// ── BFS with a queue and a head index ──
function floodFillBFS(startX, startY, replacement) {
  const start = indexOf(startX, startY);
  const target = pixels[start];
  if (target === replacement) return 0;

  const queue = [start];
  let head = 0;                       // ← nothing is ever removed from the array
  const seen = new Uint8Array(WIDTH * HEIGHT);
  seen[start] = 1;
  let count = 0;

  while (head < queue.length) {
    const index = queue[head++];
    if (pixels[index] !== target) continue;
    pixels[index] = replacement;
    count++;

    const x = index % WIDTH;
    const y = (index - x) / WIDTH;
    if (x > 0 && !seen[index - 1]) { seen[index - 1] = 1; queue.push(index - 1); }
    if (x < WIDTH - 1 && !seen[index + 1]) { seen[index + 1] = 1; queue.push(index + 1); }
    if (y > 0 && !seen[index - WIDTH]) { seen[index - WIDTH] = 1; queue.push(index - WIDTH); }
    if (y < HEIGHT - 1 && !seen[index + WIDTH]) { seen[index + WIDTH] = 1; queue.push(index + WIDTH); }
  }

  return count;
}

// ── Undo ──
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

  history.push(pixels.slice());

  if (currentTool === "bucket") {
    const visited = useBFS
      ? floodFillBFS(x, y, selectedColor)
      : floodFillDFS(x, y, selectedColor);
    render();
    updateStatus();
    console.log((useBFS ? "BFS" : "DFS") + " fill visited", visited, "pixels");
  } else {
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

// ── Why a head index? ──
document.getElementById("bench-btn").addEventListener("click", () => {
  const N = 50000;
  let sink = 0;

  const q1 = [];
  for (let i = 0; i < N; i++) q1.push(i);
  let start = performance.now();
  while (q1.length > 0) sink += q1.shift();
  const shiftMs = performance.now() - start;

  const q2 = [];
  for (let i = 0; i < N; i++) q2.push(i);
  let head = 0;
  start = performance.now();
  while (head < q2.length) sink += q2[head++];
  const headMs = performance.now() - start;

  const speedup = headMs > 0 ? Math.round(shiftMs / headMs) + "×" : "more than 1000×";
  console.log(
    "Queue benchmark (" + N.toLocaleString() + " dequeues, checksum " + sink + ")\\n" +
    "shift(): " + shiftMs.toFixed(2) + " ms · head-index: " + headMs.toFixed(4) + " ms · " + speedup
  );
});

render();
updateStatus();
console.log("BFS + DFS flood fill ready");`
	}
};
