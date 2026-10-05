// Diagram Builder — Lesson 35: The Canvas Needs a Second Representation
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 35,
	title: 'The Canvas Needs a Second Representation',
	description: `Canvas is perfect for drawing and terrible for accessibility: a bitmap has no nodes, no names and no focus. A screen reader cannot read a drawing.

The answer is not to throw Canvas away. It is to accept that **one state can have two representations**:

\`\`\`
            Diagram Model
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
     Canvas                DOM
    visual                semantic
\`\`\`

The Canvas shows the diagram. The DOM layer — real, focusable buttons positioned over the shapes — exposes the same model to the accessibility tree:

- **semantic HTML** (\`<button>\`, not a \`<div>\` with a click handler)
- **focus management** so <kbd>Tab</kbd> reaches the diagram and arrows move between nodes
- **ARIA** so each node announces its name and whether it is selected
- an **\`aria-live\` region** that narrates the selection

Both layers read the same model. Neither owns it.`,
	task: `1. Turn the **Accessibility layer** on: the nodes become real buttons over the canvas.
2. Press <kbd>Tab</kbd> to reach the diagram, then move between nodes with the arrow keys.
3. Watch the live region: every move is announced, with the node's name and position.
4. Press <kbd>Enter</kbd> to select — the Canvas and the DOM layer update together.
5. Open DevTools → Accessibility on a node and read what the browser exposes. Then turn the layer off and try again: the diagram disappears from the tree.`,
	concept: `**Two representations of one state** — a visual layer (Canvas) for the picture and a semantic layer (DOM + ARIA) for focus, keyboard and screen readers, both projected from the same model.`,
	whyItMatters: `Accessibility is not a coat of paint applied at the end: it is a second representation of your data, and it only works if the model — not the drawing — is the source of truth. This is the same lesson as "model before rendering", one level deeper.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 35</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — a visual layer and a semantic layer</h3>
  <div id="toolbar">
    <label id="toggle"><input type="checkbox" id="layer-toggle" checked /> Accessibility layer</label>
    <span id="status">Focus the diagram and use the arrow keys</span>
  </div>
  <div id="stage">
    <canvas id="canvas"></canvas>
    <div id="overlay"></div>
  </div>
  <p id="live" aria-live="polite">No node selected.</p>
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
#toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
#toggle { color: #8888aa; font-size: 13px; display: flex; align-items: center; gap: 6px; }
#status { color: #8888aa; font-size: 12px; }
#stage {
  position: relative;
  width: 640px;
  max-width: 100%;
}
#canvas {
  display: block;
  width: 100%;
  background: #0d0d1a;
  border: 1px solid #2a2a44;
  border-radius: 8px;
}
#overlay { position: absolute; inset: 0; }
.node-button {
  position: absolute;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  color: transparent;
  cursor: pointer;
}
.node-button:focus-visible {
  outline: none;
  border-color: #ffd166;
  box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.35);
}
.node-button.selected { border-color: #8b8bcc; }
#live { color: #b0b0c8; font-size: 13px; min-height: 20px; }`,
		javascript: `// Diagram Builder — Lesson 35: The Canvas Needs a Second Representation

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const liveEl = document.getElementById("live");
const statusEl = document.getElementById("status");

canvas.width = 640;
canvas.height = 360;

const model = {
  nodes: [
    { id: "n1", x: 50, y: 50, width: 150, height: 56, label: "Start" },
    { id: "n2", x: 300, y: 40, width: 150, height: 56, label: "Load data" },
    { id: "n3", x: 160, y: 200, width: 150, height: 56, label: "Render" },
    { id: "n4", x: 420, y: 210, width: 150, height: 56, label: "Save" }
  ],
  selection: null
};

const buttonByNode = new Map();

// ── Visual layer ──
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const node of model.nodes) {
    const selected = node.id === model.selection;
    ctx.fillStyle = selected ? "#2b2b4d" : "#1e1e34";
    ctx.strokeStyle = selected ? "#8b8bcc" : "#3a3a5c";
    ctx.lineWidth = selected ? 3 : 1.5;
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, node.width, node.height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e8e8f0";
    ctx.font = "600 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
  }
}

// ── Semantic layer: the same model, as focusable buttons ──
function buildDomLayer() {
  overlay.innerHTML = "";
  buttonByNode.clear();

  for (const node of model.nodes) {
    const button = document.createElement("button");
    button.className = "node-button";
    button.type = "button";
    button.textContent = node.label;
    button.setAttribute("aria-label", node.label + " (" + Math.round(node.x) + ", " + Math.round(node.y) + ")");
    button.setAttribute("aria-pressed", String(node.id === model.selection));
    button.dataset.nodeId = node.id;

    // Percentages so the layer scales with the canvas
    button.style.left = (node.x / canvas.width) * 100 + "%";
    button.style.top = (node.y / canvas.height) * 100 + "%";
    button.style.width = (node.width / canvas.width) * 100 + "%";
    button.style.height = (node.height / canvas.height) * 100 + "%";

    button.addEventListener("click", () => select(node.id, button));
    button.addEventListener("keydown", (event) => moveFocus(event, node));

    overlay.appendChild(button);
    buttonByNode.set(node.id, button);
  }
}

function syncDomLayer() {
  for (const node of model.nodes) {
    const button = buttonByNode.get(node.id);
    if (button) button.setAttribute("aria-pressed", String(node.id === model.selection));
  }
}

function select(id, button) {
  const node = model.nodes.find((candidate) => candidate.id === id);
  model.selection = id;

  liveEl.textContent = "Selected " + node.label + " at " + node.x + ", " + node.y + ".";
  statusEl.textContent = "Selected " + node.label;

  if (button) {
    button.classList.add("selected");
    button.focus();
  }
  for (const [otherId, otherButton] of buttonByNode) {
    if (otherId !== id) otherButton.classList.remove("selected");
  }

  renderCanvas();
  syncDomLayer();
}

// ── Keyboard navigation between nodes ──
function moveFocus(event, from) {
  const directions = {
    ArrowRight: { dx: 1, dy: 0 },
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowDown: { dx: 0, dy: 1 },
    ArrowUp: { dx: 0, dy: -1 }
  };
  const direction = directions[event.key];

  if (!direction) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(from.id, buttonByNode.get(from.id));
    }
    return;
  }

  event.preventDefault();

  let best = null;
  let bestScore = Infinity;

  for (const candidate of model.nodes) {
    if (candidate === from) continue;
    const dx = candidate.x - from.x;
    const dy = candidate.y - from.y;
    const forward = dx * direction.dx + dy * direction.dy;
    if (forward <= 0) continue;

    const score = forward + Math.abs(dx * direction.dy - dy * direction.dx) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (best) buttonByNode.get(best.id).focus();
}

document.getElementById("layer-toggle").addEventListener("change", (event) => {
  overlay.style.display = event.target.checked ? "block" : "none";
  statusEl.textContent = event.target.checked
    ? "Accessibility layer on"
    : "Accessibility layer off — the diagram is no longer in the accessibility tree";
  liveEl.textContent = event.target.checked ? "Diagram exposed to assistive technology." : "Diagram hidden from assistive technology.";
});

buildDomLayer();
renderCanvas();
console.log("Two representations ready:", model.nodes.length, "nodes");`
	}
};
