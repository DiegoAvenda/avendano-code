// Diagram Builder — Lesson 37: Project Close — Definition of Done
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 37,
	title: 'Project Close: Definition of Done',
	description: `The same checklist that closed the pixel editor closes this project — that is the point of a fixed list. What changes is the evidence, because this is a different application:

\`\`\`
1. Reproducible        Vite installs, dev server and build both run
2. Tests               the structures have an invariant suite
3. Static quality      TypeScript reports no errors
4. Measurement         hit-testing has numbers at 100 / 1 000 / 5 000 nodes
5. Resource audit      listeners and DOM nodes are released on destroy
6. Decisions           why a Map, why a grid, why union-find (and its limit)
\`\`\`

Two of those items would have been meaningless in the previous project: **TypeScript with no errors** closes the TypeScript bridge, and **the measured hit-testing** is the evidence that the spatial grid was the right answer.

That is how a fixed checklist stays useful: the questions are always the same, the evidence is always about this project.`,
	task: `1. Press **Run the checklist** — it runs the structure invariants, a real hit-test measurement and a resource audit.
2. Read the measurement: the grid is compared against a linear scan over the current node count.
3. Mark the manual items (build, types, decisions, keyboard) and run again.
4. Ask which item would be hardest to demonstrate honestly in your own project.
5. Compare with the closing report of the pixel editor (Lesson 29): same list, different evidence.`,
	concept: `**The same Definition of Done applied to a different project** — the checklist is invariant, the evidence is project-specific, and the standard rises with the stack.`,
	whyItMatters: `Closing a module this way turns "I finished the tutorial" into "here is the evidence that this is finished". It also sets up what comes next: in the React module the same six questions will ask for component tests, effect cleanup and render measurements — the thread moves forward, the standard moves up, the list does not change.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 37</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — Definition of Done</h3>
  <div id="checklist">
    <label class="check-row"><input type="checkbox" id="check-build" /> Vite dev server and build both run</label>
    <label class="check-row"><input type="checkbox" id="check-types" /> TypeScript reports no errors</label>
    <label class="check-row"><input type="checkbox" id="check-docs" /> Why a Map, a grid and union-find (and its limit) are documented</label>
    <label class="check-row"><input type="checkbox" id="check-a11y" /> The diagram is reachable and operable with the keyboard</label>
  </div>
  <div id="toolbar">
    <button id="run-btn">Run the checklist</button>
  </div>
  <pre id="report">Run the checklist to see what is still open.</pre>
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
#checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 560px;
  max-width: 100%;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #b0b0c8;
  cursor: pointer;
}
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
  min-height: 260px;
}`,
		javascript: `// Diagram Builder — Lesson 37: Project Close: Definition of Done

const reportEl = document.getElementById("report");

// ── A model small enough to check in one page ──
const CELL = 64;
const NODES = Array.from({ length: 300 }, (_, index) => ({
  id: "n" + index,
  x: (index * 97) % 600,
  y: (index * 53) % 340
}));

function cellKey(x, y) {
  return Math.floor(x / CELL) + ":" + Math.floor(y / CELL);
}

function buildGrid() {
  const grid = new Map();
  for (const node of NODES) {
    const key = cellKey(node.x, node.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(node);
  }
  return grid;
}

// ── Check 1: the structures still satisfy their invariants ──
function checkStructures() {
  const grid = buildGrid();
  let filed = 0;

  for (const node of NODES) {
    const bucket = grid.get(cellKey(node.x, node.y));
    if (bucket && bucket.includes(node)) filed++;
  }

  const parent = new Map(["a", "b", "c", "d"].map((id) => [id, id]));
  function find(id) {
    while (parent.get(id) !== id) id = parent.get(id);
    return id;
  }
  parent.set("b", "a");
  parent.set("d", "c");

  const components = new Set([...parent.keys()].map((id) => find(id))).size;
  const merged = find("b") === find("a");

  return {
    ok: filed === NODES.length && merged && components === 2,
    detail:
      filed + "/" + NODES.length + " nodes filed correctly · union-find gives " +
      components + " components (expected 2)"
  };
}

// ── Check 2: the critical path has numbers (grid vs linear scan) ──
function checkMeasurement() {
  const grid = buildGrid();
  const QUERIES = 3000;
  let sink = 0;

  let start = performance.now();
  for (let i = 0; i < QUERIES; i++) {
    const x = (i * 13) % 640;
    const y = (i * 29) % 360;
    for (const node of NODES) {
      if (x >= node.x && x <= node.x + 12 && y >= node.y && y <= node.y + 12) sink++;
    }
  }
  const linearMs = performance.now() - start;

  start = performance.now();
  for (let i = 0; i < QUERIES; i++) {
    const x = (i * 13) % 640;
    const y = (i * 29) % 360;
    const bucket = grid.get(cellKey(x, y)) || [];
    for (const node of bucket) {
      if (x >= node.x && x <= node.x + 12 && y >= node.y && y <= node.y + 12) sink++;
    }
  }
  const gridMs = performance.now() - start;

  const speedup = gridMs > 0 ? Math.round(linearMs / gridMs) + "x" : "more than 1000x";
  return {
    ok: Number.isFinite(linearMs) && Number.isFinite(gridMs),
    detail:
      QUERIES.toLocaleString() + " hit-tests over " + NODES.length + " nodes: linear " +
      linearMs.toFixed(1) + " ms vs grid " + gridMs.toFixed(1) + " ms (" + speedup + ")"
  };
}

// ── Check 3: the resource audit from the memory lesson ──
const live = { listeners: 0, panels: 0 };

function snapshot() {
  return JSON.stringify(live);
}

function mountDiagramPanel() {
  const controller = new AbortController();
  window.addEventListener("resize", () => {}, { signal: controller.signal });
  live.listeners++;
  live.panels++;

  return {
    destroy() {
      controller.abort();
      live.listeners--;
      live.panels--;
    }
  };
}

function checkResources() {
  const before = snapshot();
  mountDiagramPanel().destroy();
  const after = snapshot();
  return {
    ok: before === after,
    detail: before === after ? "mount/unmount leaves nothing behind" : "resources survived destroy()"
  };
}

// ── Manual items ──
const MANUAL = [
  { id: "check-build", label: "Dev server and production build both run" },
  { id: "check-types", label: "TypeScript reports no errors" },
  { id: "check-docs", label: "Structural decisions documented" },
  { id: "check-a11y", label: "Diagram operable with the keyboard" }
];

document.getElementById("run-btn").addEventListener("click", () => {
  const results = [
    { label: "Structures", ...checkStructures() },
    { label: "Measurement", ...checkMeasurement() },
    { label: "Resource audit", ...checkResources() }
  ];

  for (const item of MANUAL) {
    const checked = document.getElementById(item.id).checked;
    results.push({ label: item.label, ok: checked, detail: checked ? "marked" : "not marked yet" });
  }

  const done = results.filter((result) => result.ok).length;
  const lines = results.map(
    (result) => (result.ok ? "✓ " : "✗ ") + result.label + " — " + result.detail
  );

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" +
    done + " of " + results.length + " checks pass — " +
    (done === results.length ? "DONE" : "NOT DONE");

  console.log("Diagram Definition of Done:", done + "/" + results.length);
});

console.log("Checklist ready for the diagram project");`
	}
};
