// Diagram Builder — Lesson 34: Proximity Selection Radar
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 34,
	title: 'Proximity Selection Radar',
	type: 'challenge',
	description: `**Integrative challenge (boss fight).** The spatial hash grid from the previous lesson answers "which node is under this point?". The selection tool needs a harder question: **"which nodes are inside this circle?"** — a circular lasso of radius \`R\` around the cursor.

The naive answer is to check every node. You already know why that does not scale: the grid exists so that a query only touches the cells the circle can reach.

**The 80/20:** 80% of this is the grid you just built — cells of \`cellSize\`, \`cellAt(cellX, cellY)\`, the nodes stored inside. The 20% that is new is the geometry: turning a circle into a **range of cells to visit**, filtering the candidates by euclidean distance, and returning them ordered from the nearest to the farthest.

Implement this function in the editor:

\`\`\`ts
function getNodesInRadius(
  grid: SpatialHashGrid,
  center: { x: number; y: number },
  radius: number
): Node[]
\`\`\`

The checks verify three things: that you return exactly the nodes inside the circle, that they come back **sorted by distance**, and that you only read the cells the circle can reach.`,
	task: `1. Read the provided \`SpatialHashGrid\`: \`cellSize\`, \`cellAt(cellX, cellY)\` and the nodes it stores.
2. Turn the circle into a cell range: from \`floor((x - radius) / cellSize)\` to \`floor((x + radius) / cellSize)\`, and the same for \`y\`.
3. Collect the candidates from those cells, keep the ones whose distance to the centre is \`<= radius\`, and sort them from nearest to farthest.
4. Press **Run the checks**. The report tells you how many nodes it expected, whether the order was right, and how many cells your query read.
5. When the three cases pass, the closing card appears — read it before moving on.`,
	concept: `**Spatial range query.** A circle becomes a rectangle of cells (its bounding box), the grid turns that rectangle into a handful of buckets, and the exact geometry — the euclidean distance — is applied only to the candidates inside them.`,
	whyItMatters: `This is the same idea the grid was built for, one step further: not just "is there something here?" but "what is near this point, in order?". That is the core of spatial search, recommendation by proximity and the kind of question interviewers wrap in problems like K closest points.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 34</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — the magnetic lasso</h3>
  <div id="toolbar">
    <button id="run-btn">Run the checks</button>
  </div>
  <canvas id="canvas"></canvas>
  <pre id="report">Implement getNodesInRadius and press Run the checks.</pre>
  <section id="card" hidden>
    <h4>Challenge cleared</h4>
    <p><strong>Interview Connection:</strong> You have implemented a spatial optimization at the core of <strong>LC 973 (K Closest Points to Origin)</strong>. Put your logic to the test on LeetCode!</p>
  </section>
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
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 13px; opacity: 0.7; }
#run-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover { border-color: #8b8bcc; }
#canvas {
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  width: 640px;
  max-width: 100%;
}
#report {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 16px;
  font-family: monospace;
  font-size: 12.5px;
  line-height: 1.8;
  color: #b0b0c8;
  white-space: pre-wrap;
  width: 660px;
  max-width: 100%;
  min-height: 240px;
}
#card {
  width: 660px;
  max-width: 100%;
  background: rgba(72, 219, 251, 0.08);
  border: 1px solid #48dbfb;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.7;
}
#card h4 {
  margin-bottom: 6px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #48dbfb;
}`,
		javascript: `// Diagram Builder — Lesson 34: Proximity Selection Radar

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reportEl = document.getElementById("report");
const cardEl = document.getElementById("card");

const WIDTH = 640;
const HEIGHT = 360;
const CELL = 64;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// ── A deterministic diagram to query ──
let seed = 7;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const nodes = Array.from({ length: 60 }, (_, index) => ({
  id: "n" + index,
  x: Math.round(10 + random() * (WIDTH - 20)),
  y: Math.round(10 + random() * (HEIGHT - 20))
}));

// ── Provided: the spatial hash grid from the previous lesson ──
class SpatialHashGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.reads = 0; // how many cells a query touches
  }

  insert(node) {
    const key = this.keyFor(node.x, node.y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key).push(node);
  }

  keyFor(x, y) {
    return Math.floor(x / this.cellSize) + ":" + Math.floor(y / this.cellSize);
  }

  /** Read one cell by its integer cell coordinates. */
  cellAt(cellX, cellY) {
    this.reads++;
    return this.cells.get(cellX + ":" + cellY) || [];
  }

  resetReads() {
    this.reads = 0;
  }
}

const grid = new SpatialHashGrid(CELL);
for (const node of nodes) grid.insert(node);

const distanceTo = (node, center) => Math.hypot(node.x - center.x, node.y - center.y);

// ─────────────────────────────────────────────────────────────
// YOUR CODE (the 20%): 80% of this is the grid you already built.
// ─────────────────────────────────────────────────────────────
function getNodesInRadius(grid, center, radius) {
  // Your code here
}

// ── Provided: the checks ──
function makeBoundaryCase() {
  const smallGrid = new SpatialHashGrid(CELL);
  const pool = [
    { id: "inside", x: 100, y: 100 },
    { id: "edge", x: 150, y: 100 },
    { id: "outside", x: 151, y: 100 }
  ];

  for (const node of pool) smallGrid.insert(node);
  return { grid: smallGrid, pool };
}

const boundary = makeBoundaryCase();

const CHECKS = [
  { name: "a circle that spans several cells", center: { x: 210, y: 160 }, radius: 100 },
  { name: "a small circle near the canvas corner", center: { x: 40, y: 40 }, radius: 55 },
  { name: "a node exactly on the radius counts", center: { x: 100, y: 100 }, radius: 50, ...boundary },
  { name: "a circle with nothing inside", center: { x: 1, y: 1 }, radius: 5 }
];

function cellsInBoundingBox(center, radius, cellSize) {
  const minX = Math.floor((center.x - radius) / cellSize);
  const maxX = Math.floor((center.x + radius) / cellSize);
  const minY = Math.floor((center.y - radius) / cellSize);
  const maxY = Math.floor((center.y + radius) / cellSize);
  return (maxX - minX + 1) * (maxY - minY + 1);
}

function runChecks() {
  const lines = [];

  for (const check of CHECKS) {
    const activeGrid = check.grid ?? grid;
    const pool = check.pool ?? nodes;
    const expected = pool
      .filter((node) => distanceTo(node, check.center) <= check.radius)
      .sort((a, b) => distanceTo(a, check.center) - distanceTo(b, check.center));

    activeGrid.resetReads();

    let actual;
    let error = null;
    try {
      actual = getNodesInRadius(activeGrid, check.center, check.radius);
    } catch (thrown) {
      error = thrown.message;
    }

    const notes = [];
    const isArray = Array.isArray(actual);
    if (!isArray) notes.push(error ? "error: " + error : "expected an array");

    if (isArray) {
      const expectedIds = [...expected.map((node) => node.id)].sort().join(",");
      const actualIds = [...new Set(actual.map((node) => node.id))].sort().join(",");
      if (expectedIds !== actualIds) notes.push("expected [" + expectedIds + "], received [" + actualIds + "]");

      const distances = actual.map((node) => distanceTo(node, check.center));
      const sorted = distances.every((value, index) => index === 0 || distances[index - 1] <= value);
      if (!sorted) notes.push("the nodes are not sorted from nearest to farthest");

      const limit = cellsInBoundingBox(check.center, check.radius, activeGrid.cellSize);
      if (activeGrid.reads < 1) notes.push("the grid was never queried");
      else if (activeGrid.reads > limit) notes.push("read " + activeGrid.reads + " cells, expected at most " + limit);
    }

    const ok = notes.length === 0;
    lines.push(
      (ok ? "✓ " : "✗ ") + check.name +
        (ok
          ? " — " + expected.length + " node(s), " + activeGrid.reads + " cell(s) read"
          : "\\n    " + notes.join("\\n    "))
    );
  }

  const failed = lines.filter((line) => line.startsWith("✗")).length;
  const passed = CHECKS.length - failed;

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" + passed + " of " + CHECKS.length + " cases pass" +
    (failed === 0 ? " — challenge cleared" : "");

  drawSample();
  cardEl.hidden = failed !== 0;
  console.log("radius challenge:", passed + "/" + CHECKS.length, "cases");
}

// ── Provided: visual feedback ──
function drawSample() {
  const center = { x: 210, y: 160 };
  const radius = 100;

  let found = [];
  try {
    found = getNodesInRadius(grid, center, radius) || [];
  } catch {
    found = [];
  }

  const selected = new Set(found.map((node) => node.id));

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "#48dbfb";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (const node of nodes) {
    const chosen = selected.has(node.id);
    ctx.fillStyle = chosen ? "#ffd166" : "#3a3a5c";
    ctx.fillRect(node.x - 4, node.y - 4, 8, 8);

    if (chosen) {
      ctx.strokeStyle = "rgba(255, 209, 102, 0.4)";
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#48dbfb";
  ctx.fillRect(center.x - 3, center.y - 3, 6, 6);
}

document.getElementById("run-btn").addEventListener("click", runChecks);

drawSample();
runChecks();
console.log("Implement getNodesInRadius and press Run the checks");`
	}
};
