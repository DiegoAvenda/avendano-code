// Diagram Builder — Lesson 39: Project Close: Definition of Done
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 39,
	title: 'Project Close: Definition of Done',
	description: `Same checklist, different tools — and that is the whole point of closing this module.

In Módulo 0 "done" had to be verified by hand, because there was no tooling: a clean console, logic checked with your own assertions, a resource audit you ran yourself. This project lives in a real local toolchain instead, so the bar moves up:

\`\`\`
1. Linter & formatter   ESLint + Prettier green on your machine
2. Tests                the invariant suite green under Vitest
3. Benchmark            the hit-testing numbers measured and documented
\`\`\`

Two of those are tools you run in the terminal, not sentences in a lesson. The third is a measurement: the spatial grid only earns its place if the numbers say so.`,
	task: `1. Press **Run the checklist** — it executes the same assertions your Vitest suite runs, plus the hit-testing benchmark.
2. Mark the two items that depend on your machine: ESLint and Prettier green, and the benchmark numbers written down.
3. Compare with the closing report of Módulo 0 (Lesson 29): there, everything was manual.
4. If any assertion fails, fix the structure before closing the project.
5. Ask what would have to be automated next: a pipeline that runs these three on every push.`,
	concept: `**The checklist escalates with the toolchain** — the intent (evidence, not opinions) never changes; the tools that produce the evidence do. Manual in Módulo 0, local tooling in Módulo 1.`,
	whyItMatters: `Closing a project with tools instead of with your eyes is the difference between "I think it works" and "the tool says it works". It is also the moment the course stops depending on you remembering to check.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 39</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — Definition of Done (local toolchain)</h3>
  <div id="checklist">
    <label class="check-row"><input type="checkbox" id="check-lint" /> ESLint and Prettier green on my machine</label>
    <label class="check-row"><input type="checkbox" id="check-bench-doc" /> The hit-testing numbers are documented</label>
  </div>
  <div id="toolbar">
    <button id="run-btn">Run the checklist</button>
  </div>
  <pre id="report">Run the checklist to see the three requirements.</pre>
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
#run-btn:hover { border-color: #2ecc71; }
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
  min-height: 280px;
}`,
		javascript: `// Diagram Builder — Lesson 39: Project Close: Definition of Done

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

// ── Requirement 2: the assertions your Vitest suite runs ──
function checkInvariants() {
  const grid = buildGrid();
  let passed = 0;
  let total = 0;

  const expect = (actual, expected) => {
    total++;
    if (JSON.stringify(actual) === JSON.stringify(expected)) passed++;
  };

  // every node is filed under the cell that contains it
  let filed = 0;
  for (const node of NODES) {
    const bucket = grid.get(cellKey(node.x, node.y));
    if (bucket && bucket.includes(node)) filed++;
  }
  expect(filed, NODES.length);

  // union-find merges two groups and leaves the others alone
  const parent = new Map(["a", "b", "c", "d"].map((id) => [id, id]));
  const find = (id) => {
    while (parent.get(id) !== id) id = parent.get(id);
    return id;
  };
  parent.set("b", "a");
  parent.set("d", "c");
  const components = new Set([...parent.keys()].map((id) => find(id))).size;
  expect(components, 2);

  return { ok: passed === total, detail: passed + "/" + total + " assertions pass" };
}

// ── Requirement 3: the hit-testing benchmark ──
function checkHitTesting() {
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
      QUERIES.toLocaleString() + " queries over " + NODES.length + " nodes: linear " +
      linearMs.toFixed(1) + " ms vs grid " + gridMs.toFixed(1) + " ms (" + speedup + ")"
  };
}

// ── The three requirements ──
function runChecklist() {
  const lintChecked = document.getElementById("check-lint").checked;
  const documentedChecked = document.getElementById("check-bench-doc").checked;

  const tests = checkInvariants();
  const benchmark = checkHitTesting();

  const results = [
    {
      label: "Linter & formatter (ESLint + Prettier)",
      ok: lintChecked,
      detail: lintChecked ? "green on your machine" : "run npm run lint locally and mark it"
    },
    {
      label: "Local tests (Vitest)",
      ok: tests.ok,
      detail: tests.detail
    },
    {
      label: "Hit-testing benchmark documented",
      ok: benchmark.ok && documentedChecked,
      detail: benchmark.detail + (documentedChecked ? " · documented" : " · not documented yet")
    }
  ];

  const done = results.filter((result) => result.ok).length;
  const lines = results.map(
    (result) => (result.ok ? "✓ " : "✗ ") + result.label + " — " + result.detail
  );

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" +
    done + " of " + results.length + " requirements pass — " +
    (done === results.length ? "DONE" : "NOT DONE") +
    "\\n\\nin Módulo 0 this same checklist was verified by hand.\\n" +
    "Here two of the three come from local tools.";

  console.log("Definition of Done (local toolchain):", done + "/" + results.length);
}

document.getElementById("run-btn").addEventListener("click", runChecklist);

runChecklist();`
	}
};
