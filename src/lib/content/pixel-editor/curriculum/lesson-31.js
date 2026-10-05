// Diagram Builder — Lesson 31: Finding Things
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 31,
	title: 'Finding Things',
	description: `The diagram has nodes, and every interaction starts with the same question: **give me the node with this id**.

The obvious answer is a scan:

\`\`\`
nodes.find((node) => node.id === targetId)
\`\`\`

It is correct and it reads well. It is also O(n) — and in an editor we ask this question constantly: on every click, on every connection, on every render of a selection.

So we measure it. Then we add a second structure that answers the same question in O(1):

\`\`\`
const nodesById = new Map(nodes.map((node) => [node.id, node]));
\`\`\`

This is the shift the whole lesson is about. The question stops being "what is a hash map?" and becomes **"why did you choose a Map here?"** — and the answer is a measured access pattern.`,
	task: `1. Look at \`findByScan\` and \`findByIndex\`: same question, two structures.
2. Click a node on the canvas — the click handler has to find the node under the cursor.
3. Press **Benchmark** to run thousands of lookups on both versions.
4. Read the report: the scan grows with the number of nodes, the Map does not.
5. Ask what the Map costs: memory, and staying in sync when nodes are added or removed.`,
	concept: `**Map-based index** — a second data structure that trades memory for O(1) lookup by key, chosen because the access pattern ("find by id") is frequent.`,
	whyItMatters: `This is the first time in the project where we keep two structures for the same data, and it will not be the last. Choosing a data structure is not about which one is "better" — it is about which operations you perform. In the next lesson the access pattern changes again, and so will the answer.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 31</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — find a node by id</h3>
  <div id="toolbar">
    <button id="bench-btn">Benchmark</button>
    <span id="status">Click a node</span>
  </div>
  <canvas id="canvas"></canvas>
  <p id="report">2,000 nodes. Click one, or benchmark lookups.</p>
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
#toolbar { display: flex; align-items: center; gap: 12px; }
#bench-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#bench-btn:hover { border-color: #8b8bcc; }
#status { color: #8888aa; font-size: 12px; }
#canvas {
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  width: 640px;
  max-width: 100%;
  cursor: pointer;
}
#report { color: #8888aa; font-size: 13px; text-align: center; white-space: pre-line; min-height: 40px; }`,
		javascript: `// Diagram Builder — Lesson 31: Finding Things

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const reportEl = document.getElementById("report");

const NODE_COUNT = 2000;

// A deterministic generator so the numbers are stable between runs.
let seed = 7;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const model = {
  nodes: Array.from({ length: NODE_COUNT }, (_, index) => ({
    id: "n" + index,
    x: 10 + random() * 600,
    y: 10 + random() * 340,
    size: 16,
    label: "N" + index
  })),
  selection: null
};

// ── Question: find a node by id ──
// Version A: scan the array. O(n), no extra memory.
function findByScan(id) {
  return model.nodes.find((node) => node.id === id);
}

// Version B: keep an index beside the array. O(1), extra memory.
const nodesById = new Map(model.nodes.map((node) => [node.id, node]));
function findByIndex(id) {
  return nodesById.get(id);
}

canvas.width = 640;
canvas.height = 360;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const node of model.nodes) {
    ctx.fillStyle = node.id === model.selection ? "#8b8bcc" : "#3a3a5c";
    ctx.fillRect(node.x, node.y, node.size, node.size);
  }
}

function hitTest(x, y) {
  return model.nodes.find(
    (node) =>
      x >= node.x && x <= node.x + node.size && y >= node.y && y <= node.y + node.size
  );
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

  const hit = hitTest(x, y);
  model.selection = hit ? hit.id : null;
  statusEl.textContent = hit ? "Selected " + hit.id + " (via scan)" : "Nothing selected";
  render();
});

document.getElementById("bench-btn").addEventListener("click", () => {
  const LOOKUPS = 20000;
  const target = model.nodes[model.nodes.length - 1].id;

  let start = performance.now();
  for (let i = 0; i < LOOKUPS; i++) findByScan(target);
  const scanMs = performance.now() - start;

  start = performance.now();
  for (let i = 0; i < LOOKUPS; i++) findByIndex(target);
  const indexMs = performance.now() - start;

  const speedup = indexMs > 0 ? Math.round(scanMs / indexMs) + "×" : "more than 1000×";
  reportEl.textContent =
    LOOKUPS.toLocaleString() + " lookups over " + NODE_COUNT.toLocaleString() + " nodes\\n" +
    "Array.find : " + scanMs.toFixed(1) + " ms\\n" +
    "Map.get    : " + indexMs.toFixed(2) + " ms\\n" +
    "Speed-up   : " + speedup;

  console.log("find:", scanMs.toFixed(1), "ms · Map:", indexMs.toFixed(2), "ms");
});

render();
console.log("Index built for", nodesById.size, "nodes");`
	}
};
