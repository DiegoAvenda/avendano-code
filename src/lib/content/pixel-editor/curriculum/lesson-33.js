// Diagram Builder — Lesson 33: Groups and Connections
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 33,
	title: 'Groups and Connections',
	description: `The connections are the interesting part of a diagram: they turn a list of shapes into a **graph**.

The question we want to answer is simple to say and expensive to answer naively:

\`\`\`
"Are these two nodes connected, directly or through others?"
"How many separate groups does this diagram have?"
\`\`\`

Walking the graph from every node works, but it repeats a lot of work. The classic structure for connectivity is **union-find** (disjoint sets): every node starts alone, and each connection *merges* two groups.

\`\`\`
find(a)          → which group is a in?
union(a, b)      → merge both groups
\`\`\`

With path compression and union by size, both operations are effectively constant. Counting groups becomes a single pass over the nodes.

And then the honest part: **union-find merges, it does not split**. Removing a connection cannot be undone by the structure — you have to rebuild it. A data structure is neither good nor bad; it is adequate or inadequate for the operations you need.`,
	task: `1. Look at \`find\` and \`union\` — the whole structure is a parent table plus two rules.
2. Read the report: how many groups does the diagram have right now?
3. Press **Add connection** to merge two groups and watch the colors change.
4. Press **Remove connection** and read what happens: the structure cannot split, so it is rebuilt from the edges.
5. Compare with the earlier lesson: which operations did the Map support well? Which ones does union-find support well?`,
	concept: `**Union-find (disjoint sets)** — a parent table with path compression and union by size that answers connectivity queries in near-constant time, at the cost of not supporting deletion.`,
	whyItMatters: `Connectivity is a question about *relationships*, not about coordinates or ids, and it needs its own structure. The limitation you just saw is the lesson: choosing a structure means choosing which operations will be cheap and which will be expensive, and that trade-off should be a decision, not an accident.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 33</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — groups and connections</h3>
  <div id="toolbar">
    <button id="add-btn">Add connection</button>
    <button id="remove-btn">Remove connection</button>
    <span id="status">Groups: —</span>
  </div>
  <canvas id="canvas"></canvas>
  <p id="report">Press a button to change the graph.</p>
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
#toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
#add-btn, #remove-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#add-btn:hover, #remove-btn:hover { border-color: #8b8bcc; }
#status { color: #8888aa; font-size: 12px; }
#canvas {
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  width: 640px;
  max-width: 100%;
}
#report { color: #8888aa; font-size: 13px; text-align: center; white-space: pre-line; min-height: 56px; max-width: 620px; }`,
		javascript: `// Diagram Builder — Lesson 33: Groups and Connections

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const reportEl = document.getElementById("report");

canvas.width = 640;
canvas.height = 360;

const model = {
  nodes: [
    { id: "n1", x: 60, y: 60, label: "A" },
    { id: "n2", x: 240, y: 50, label: "B" },
    { id: "n3", x: 420, y: 90, label: "C" },
    { id: "n4", x: 100, y: 230, label: "D" },
    { id: "n5", x: 300, y: 250, label: "E" },
    { id: "n6", x: 520, y: 240, label: "F" }
  ],
  connections: [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
    { from: "n4", to: "n5" }
  ]
};

// ── Union-Find ──
const parent = new Map();
const sizes = new Map();

function makeSet(id) {
  parent.set(id, id);
  sizes.set(id, 1);
}

function find(id) {
  let root = id;
  while (parent.get(root) !== root) {
    parent.set(root, parent.get(parent.get(root))); // path compression
    root = parent.get(root);
  }
  return root;
}

function union(a, b) {
  let rootA = find(a);
  let rootB = find(b);
  if (rootA === rootB) return false;

  // union by size: attach the smaller group under the bigger one
  if (sizes.get(rootA) < sizes.get(rootB)) [rootA, rootB] = [rootB, rootA];
  parent.set(rootB, rootA);
  sizes.set(rootA, sizes.get(rootA) + sizes.get(rootB));
  return true;
}

// Removing an edge is not a union-find operation: rebuild from the edges.
function rebuild() {
  parent.clear();
  sizes.clear();
  for (const node of model.nodes) makeSet(node.id);
  for (const connection of model.connections) union(connection.from, connection.to);
}

function groups() {
  const byRoot = new Map();
  for (const node of model.nodes) {
    const root = find(node.id);
    if (!byRoot.has(root)) byRoot.set(root, []);
    byRoot.get(root).push(node.id);
  }
  return byRoot;
}

const GROUP_COLORS = ["#8b8bcc", "#e94560", "#48dbfb", "#2ecc71", "#ffd166", "#8338ec"];
let colorByNode = new Map();

function recolor() {
  colorByNode = new Map();
  let index = 0;
  for (const [, members] of groups()) {
    const color = GROUP_COLORS[index % GROUP_COLORS.length];
    for (const id of members) colorByNode.set(id, color);
    index++;
  }
}

function center(id) {
  const node = model.nodes.find((candidate) => candidate.id === id);
  return { x: node.x, y: node.y };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#5a5a7c";
  ctx.lineWidth = 2;
  for (const connection of model.connections) {
    const from = center(connection.from);
    const to = center(connection.to);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  for (const node of model.nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
    ctx.fillStyle = colorByNode.get(node.id) || "#3a3a5c";
    ctx.fill();

    ctx.fillStyle = "#12122a";
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  }
}

function describe() {
  const byRoot = groups();
  statusEl.textContent = "Groups: " + byRoot.size;
  return (
    "nodes: " + model.nodes.length +
    " · connections: " + model.connections.length +
    " · groups: " + byRoot.size + "\\n" +
    [...byRoot.values()].map((members) => "[" + members.join(", ") + "]").join("  ")
  );
}

let pairIndex = 0;
const CANDIDATE_PAIRS = [
  ["n3", "n4"],
  ["n5", "n6"],
  ["n2", "n6"],
  ["n1", "n5"]
];

document.getElementById("add-btn").addEventListener("click", () => {
  const pair = CANDIDATE_PAIRS[pairIndex % CANDIDATE_PAIRS.length];
  pairIndex++;

  if (find(pair[0]) !== find(pair[1])) {
    union(pair[0], pair[1]);
    model.connections.push({ from: pair[0], to: pair[1] });
    reportEl.textContent = "union(" + pair[0] + ", " + pair[1] + ") merged two groups\\n" + describe();
  } else {
    reportEl.textContent = pair[0] + " and " + pair[1] + " are already connected\\n" + describe();
  }
  recolor();
  render();
});

document.getElementById("remove-btn").addEventListener("click", () => {
  if (model.connections.length === 0) return;
  const removed = model.connections.pop();
  rebuild(); // union-find cannot split: recompute from scratch
  recolor();
  render();
  reportEl.textContent =
    "removed " + removed.from + " → " + removed.to +
    "\\nunion-find cannot split groups, so the structure was rebuilt\\n" + describe();
});

rebuild();
recolor();
render();
reportEl.textContent = describe();
console.log("Union-find ready:", describe());`
	}
};
