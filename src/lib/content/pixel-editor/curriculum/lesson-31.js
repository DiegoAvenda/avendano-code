// Diagram Builder — Lesson 31: Model Before Rendering
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 31,
	title: 'Model Before Rendering',
	description: `Module 1 is a different project: a **Flowchart & Diagram Builder**. Different stack, different data, but the same discipline we used for the pixel editor — and it starts one step earlier.

Do not start by drawing rectangles. Start with the model:

\`\`\`
Node        { id, x, y, width, height, label }
Connection  { id, from, to }
Selection   the id of the selected node (or null)
Tool        "select" | "move" | "connect"
CanvasState { width, height, pan, zoom }
\`\`\`

The priority is always the same:

\`\`\`
DATA MODEL → BUSINESS LOGIC → RENDERING
\`\`\`

Rendering is the last step, and it is replaceable. If you start with the rectangles, the rectangles become your data model and every feature afterwards has to be reverse-engineered out of the drawing.`,
	task: `1. Read the \`model\` object: nodes, connections, selection, tool and canvas state.
2. Look at \`render()\` — it only reads the model, it never mutates it.
3. Change a node's \`x\`/\`y\` or add a new node in the array and reload: the drawing follows the data.
4. Add a \`Connection\` between two nodes that do not have one and watch the arrow appear.
5. Ask: if tomorrow we render with SVG or with DOM elements instead of Canvas, how much of this code would have to change?`,
	concept: `**Model first** — the application state is described by data structures (nodes, connections, selection, tool) and rendering is a read-only projection of that data.`,
	whyItMatters: `Every feature we are about to build — finding nodes, hit-testing thousands of them, connectivity, accessibility, cleanup — is a question about the model, not about the drawing. Getting the model right is what makes the rest possible.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 31</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — the model comes first</h3>
  <canvas id="canvas"></canvas>
  <pre id="model"></pre>
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
#canvas {
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  width: 640px;
  max-width: 100%;
}
#model {
  width: 640px;
  max-width: 100%;
  max-height: 220px;
  overflow: auto;
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 10px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #b0b0c8;
}`,
		javascript: `// Diagram Builder — Lesson 31: Model Before Rendering

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const modelEl = document.getElementById("model");

// ── 1. The model: everything the editor knows ──
const model = {
  canvas: { width: 640, height: 380, pan: { x: 0, y: 0 }, zoom: 1 },
  nodes: [
    { id: "n1", x: 60, y: 70, width: 150, height: 60, label: "Start" },
    { id: "n2", x: 320, y: 50, width: 150, height: 60, label: "Load data" },
    { id: "n3", x: 190, y: 230, width: 150, height: 60, label: "Render" }
  ],
  connections: [
    { id: "c1", from: "n1", to: "n2" },
    { id: "c2", from: "n2", to: "n3" },
    { id: "c3", from: "n1", to: "n3" }
  ],
  selection: null,
  tool: "select"
};

canvas.width = model.canvas.width;
canvas.height = model.canvas.height;

const COLORS = {
  node: "#1e1e34",
  border: "#3a3a5c",
  selected: "#8b8bcc",
  line: "#5a5a7c",
  text: "#e8e8f0"
};

function findNode(id) {
  return model.nodes.find((node) => node.id === id);
}

function centerOf(node) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

// ── 2. Business logic would live here ──
// (move, connect, select, delete …) It works on the model, never on pixels.

// ── 3. Rendering: a read-only projection of the model ──
function drawConnection(from, to) {
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = COLORS.line;
  ctx.fill();
}

function drawNode(node) {
  ctx.fillStyle = COLORS.node;
  ctx.strokeStyle = node.id === model.selection ? COLORS.selected : COLORS.border;
  ctx.lineWidth = node.id === model.selection ? 3 : 1.5;

  ctx.beginPath();
  ctx.roundRect(node.x, node.y, node.width, node.height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const connection of model.connections) {
    const from = findNode(connection.from);
    const to = findNode(connection.to);
    if (from && to) drawConnection(centerOf(from), centerOf(to));
  }

  for (const node of model.nodes) drawNode(node);
}

render();
modelEl.textContent = JSON.stringify(model, null, 2);

console.log(
  "Model ready:",
  model.nodes.length + " nodes, " + model.connections.length + " connections"
);`
	}
};
