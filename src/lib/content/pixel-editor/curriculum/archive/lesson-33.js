// Diagram Builder — Lesson 33: Too Many Nodes
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 33,
	title: 'Too Many Nodes',
	description: `The Map solved "find by id". But there is a second question in every editor, and it is the one the user asks with the mouse:

**"Which node is under this point?"**

The first implementation answers it by checking every node in order:

\`\`\`
for every node:
   if the point is inside its bounds → return it
\`\`\`

It is correct. It also becomes a problem exactly when the diagram grows, because every mouse movement asks the question again.

The fix is to notice that the **access pattern changed**: we do not want "the node with this id", we want "the nodes near this coordinate". That is a spatial question, so it gets a spatial structure: a **spatial hash grid**.

\`\`\`
cell = (floor(x / CELL), floor(y / CELL))
grid[cell] = [ …nodes roughly in that square… ]
\`\`\`

Hit-testing then only touches the bucket for that cell — a handful of nodes instead of all of them.`,
	task: `1. Press **Benchmark** and compare linear hit-testing with the grid at 100, 1,000 and 5,000 nodes.
2. Watch how the linear cost grows with the node count while the grid stays roughly flat.
3. Move the mouse over the canvas: the hovered node is highlighted using the grid.
4. Read \`cellKey\` and \`queryCell\` — the whole idea is two lines of index arithmetic.
5. Ask: what breaks if nodes can be bigger than a cell, or if they move? (Spoiler: the index has to be updated.)`,
	concept: `**Spatial hash grid** — a hash map from grid cell to the elements inside it, so a "near this point" query only inspects one bucket instead of the whole collection.`,
	whyItMatters: `A data structure is adequate or inadequate for a pattern of operations. The array was fine for "find by id" while the list was small; the grid is the right answer for "find near a point". Noticing that the *question* changed — not that the old code was wrong — is the skill this whole module is practising.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 33</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — hit-testing thousands of nodes</h3>
  <div id="toolbar">
    <button class="node-btn" data-count="100">100 nodes</button>
    <button class="node-btn" data-count="1000">1,000 nodes</button>
    <button class="node-btn" data-count="5000">5,000 nodes</button>
    <button id="bench-btn">Benchmark queries</button>
    <span id="status">Hover the canvas</span>
  </div>
  <canvas id="canvas"></canvas>
  <p id="report">Pick a size and benchmark hit-testing.</p>
  <script src="script.js"></script>
</body>
</html>`,
		css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #12122a;
  color: #e8e8f0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 12px;
}
h3 { font-size: 13px; opacity: 0.7; }
#toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; justify-content: center; }
.node-btn, #bench-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.node-btn.active { background: #8b8bcc; border-color: #8b8bcc; color: #12122a; }
#status { color: #8888aa; font-size: 12px; }
#canvas {
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  width: 640px;
  max-width: 100%;
}
#report { color: #8888aa; font-size: 13px; text-align: center; white-space: pre-line; min-height: 56px; }`,
		javascript: `// Diagram Builder — Lesson 33: Too Many Nodes

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const reportEl = document.getElementById("report");

canvas.width = 640;
canvas.height = 360;

const CELL = 64;

let seed = 11;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

let nodes = [];
let grid = new Map();
let hovered = null;

function cellKey(x, y) {
  return Math.floor(x / CELL) + ":" + Math.floor(y / CELL);
}

// ── Build the spatial index: one pass over the nodes ──
function buildGrid() {
  grid = new Map();
  for (const node of nodes) {
    const key = cellKey(node.x, node.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(node);
  }
}

function queryCell(x, y) {
  const bucket = grid.get(cellKey(x, y));
  if (!bucket) return null;
  for (const node of bucket) {
    if (x >= node.x && x <= node.x + node.size && y >= node.y && y <= node.y + node.size) {
      return node;
    }
  }
  return null;
}

function queryLinear(x, y) {
  for (const node of nodes) {
    if (x >= node.x && x <= node.x + node.size && y >= node.y && y <= node.y + node.size) {
      return node;
    }
  }
  return null;
}

function setCount(count) {
  seed = 11;
  nodes = Array.from({ length: count }, (_, index) => ({
    id: "n" + index,
    x: 8 + random() * 618,
    y: 8 + random() * 338,
    size: 12
  }));
  buildGrid();
  hovered = null;
  render();

  document.querySelectorAll(".node-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.count) === count);
  });

  reportEl.textContent =
    count.toLocaleString() + " nodes · grid buckets: " + grid.size +
    "\\nNow benchmark the two query strategies.";
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const node of nodes) {
    ctx.fillStyle = node === hovered ? "#8b8bcc" : "#3a3a5c";
    ctx.fillRect(node.x, node.y, node.size, node.size);
  }
}

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

  hovered = queryCell(x, y);
  statusEl.textContent = hovered ? "Hovering " + hovered.id + " (grid lookup)" : "Hover the canvas";
  render();
});

document.querySelectorAll(".node-btn").forEach((btn) => {
  btn.addEventListener("click", () => setCount(Number(btn.dataset.count)));
});

document.getElementById("bench-btn").addEventListener("click", () => {
  const QUERIES = 5000;
  let start = performance.now();
  for (let i = 0; i < QUERIES; i++) {
    queryLinear(random() * 640, random() * 360);
  }
  const linearMs = performance.now() - start;

  start = performance.now();
  for (let i = 0; i < QUERIES; i++) {
    queryCell(random() * 640, random() * 360);
  }
  const gridMs = performance.now() - start;

  const speedup = gridMs > 0 ? Math.round(linearMs / gridMs) + "×" : "more than 1000×";
  reportEl.textContent =
    QUERIES.toLocaleString() + " hit-tests over " + nodes.length.toLocaleString() + " nodes\\n" +
    "Linear scan : " + linearMs.toFixed(1) + " ms\\n" +
    "Spatial grid: " + gridMs.toFixed(1) + " ms\\n" +
    "Speed-up    : " + speedup;

  console.log("hit-test:", linearMs.toFixed(1), "ms linear ·", gridMs.toFixed(1), "ms grid");
});

setCount(1000);
console.log("Spatial grid ready — cell size", CELL);`
	}
};
