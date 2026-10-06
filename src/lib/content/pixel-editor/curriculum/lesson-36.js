// Diagram Builder — Lesson 36: Testing the Structures
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 36,
	title: 'Testing the Structures',
	description: `In Module 0 you wrote your own test harness: eleven lines, no dependencies, and it was the right tool for what it tested — pure functions like the index math or the ring buffer.

These structures are a different story:

\`\`\`
Map            find a node by id            O(1)
spatial grid   find nodes near a point      one bucket instead of all
union-find     are these two connected?     near O(1)
\`\`\`

A wrong bucket key does not throw: it returns the wrong node, or none, and the canvas looks *almost* right. What you need are **invariants** — properties that must hold for every input:

\`\`\`
every node is filed under the cell that contains it
find() of an unknown id returns undefined, never a wrong node
after union(a, b): find(a) === find(b)
after a rebuild, the component count matches a fresh computation
\`\`\`

Checking those by hand, in a browser page, does not scale — and it does not run on your machine before you push. So this is where the course stops writing its own harness and installs a real test runner: **Vitest**.

\`\`\`
npm install --save-dev vitest
npx vitest
\`\`\`

The assertions are the ones you already know. What changes is who runs them, and when.`,
	task: `1. \`npm install --save-dev vitest\` and add \`"test": "vitest run"\` to your \`package.json\` scripts.
2. Create \`src/structures.test.ts\` with the file below — it imports your real \`grid\` and \`union-find\` modules.
3. Run \`npm test\` and read the report: one line per invariant, and a non-zero exit code when one breaks.
4. Press **Run the suite** here to execute the same invariants in the page.
5. Press **Show the Vitest file** and compare: same assertions, now in files Vitest discovers on its own — no page to open, no output to watch.`,
	concept: `**From a hand-made harness to a test framework** — the idea is identical (set up, assert, report); what the framework adds is a runner that discovers the files, executes them in Node and fails loudly, without you opening a page.`,
	whyItMatters: `Vitest is not "nicer syntax": it is the automation layer. It runs when you forget to, it fails the build when an invariant breaks, and it is exactly what the closing checklist of this module (Lesson 37) demands.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 36</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — the invariant suite, now run by Vitest</h3>
  <div id="toolbar">
    <button id="run-btn">Run the suite</button>
    <button id="file-btn">Show the Vitest file</button>
  </div>
  <pre id="report">Press Run the suite.</pre>
  <pre id="file" hidden></pre>
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
#toolbar { display: flex; gap: 8px; }
#run-btn, #file-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover, #file-btn:hover { border-color: #8b8bcc; }
#report, #file {
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
		javascript: `// Diagram Builder — Lesson 36: Testing the Structures

const reportEl = document.getElementById("report");
const fileEl = document.getElementById("file");

// ── The structures under test ──
const NODES = [
  { id: "n1", x: 10, y: 10 },
  { id: "n2", x: 70, y: 20 },
  { id: "n3", x: 65, y: 65 },
  { id: "n4", x: 130, y: 130 }
];

const CELL = 64;
function cellKey(x, y) {
  return Math.floor(x / CELL) + ":" + Math.floor(y / CELL);
}

function buildGrid(nodes) {
  const grid = new Map();
  for (const node of nodes) {
    const key = cellKey(node.x, node.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(node);
  }
  return grid;
}

const grid = buildGrid(NODES);

function queryCell(candidateGrid, x, y, nodes) {
  const bucket = candidateGrid.get(cellKey(x, y)) || [];
  for (const node of bucket) {
    if (x >= node.x && x <= node.x + 12 && y >= node.y && y <= node.y + 12) return node;
  }
  return undefined;
}

const parent = new Map();
const sizes = new Map();

function makeSet(id) {
  parent.set(id, id);
  sizes.set(id, 1);
}

function find(id) {
  let root = id;
  while (parent.get(root) !== root) {
    parent.set(root, parent.get(parent.get(root)));
    root = parent.get(root);
  }
  return root;
}

function union(a, b) {
  let rootA = find(a);
  let rootB = find(b);
  if (rootA === rootB) return false;
  if (sizes.get(rootA) < sizes.get(rootB)) [rootA, rootB] = [rootB, rootA];
  parent.set(rootB, rootA);
  sizes.set(rootA, sizes.get(rootA) + sizes.get(rootB));
  return true;
}

function rebuild(edges) {
  parent.clear();
  sizes.clear();
  for (const node of NODES) makeSet(node.id);
  for (const edge of edges) union(edge[0], edge[1]);
}

function componentCount() {
  return new Set(NODES.map((node) => find(node.id))).size;
}

// ── A four-line stand-in for the runner ──
// Vitest is the real runner; this page mirrors its assertions so you can read them.
const lines = [];

function it(name, fn) {
  try {
    fn();
    lines.push("✓ " + name);
  } catch (error) {
    lines.push("✗ " + name + "\\n    " + error.message);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error("expected " + JSON.stringify(expected) + ", received " + JSON.stringify(actual));
      }
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error("expected undefined, received " + JSON.stringify(actual));
    },
    toContain(expected) {
      if (!actual || !actual.includes(expected)) throw new Error("expected the collection to contain the value");
    }
  };
}

// ── The same suite that lives in src/structures.test.ts ──
function runSuite() {
  lines.length = 0;

  it("files every node under the cell that contains it", () => {
    for (const node of NODES) {
      expect(grid.get(cellKey(node.x, node.y))).toContain(node);
    }
  });

  it("finds a node that sits on a cell boundary", () => {
    expect(queryCell(grid, 66, 66, NODES).id).toBe("n3");
  });

  it("returns undefined for a point with no node", () => {
    expect(queryCell(grid, 500, 500, NODES)).toBeUndefined();
  });

  it("gives merged nodes the same root", () => {
    rebuild([]);
    union("n1", "n2");
    expect(find("n1")).toBe(find("n2"));
  });

  it("keeps the component count stable", () => {
    rebuild([
      ["n1", "n2"],
      ["n2", "n3"]
    ]);
    expect(componentCount()).toBe(2);
  });

  const failed = lines.filter((line) => line.startsWith("✗")).length;
  const passed = lines.length - failed;

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" +
    passed + " passed, " + failed + " failed" +
    "\\n\\nthis page runs them for you once. Locally,\\n" +
    "\`npx vitest\` runs this suite on every change.";

  console.log("vitest suite (mirrored here):", passed, "passed,", failed, "failed");
}

const VITEST_FILE = \`import { describe, expect, it } from "vitest";
import { buildGrid, cellKey, queryCell } from "./grid";
import { createUnionFind } from "./union-find";

describe("spatial hash grid", () => {
  it("files every node under the cell that contains it", () => {
    const nodes = [
      { id: "n1", x: 10, y: 10 },
      { id: "n2", x: 70, y: 20 },
      { id: "n3", x: 65, y: 65 }
    ];
    const grid = buildGrid(nodes);

    for (const node of nodes) {
      expect(grid.get(cellKey(node.x, node.y))).toContain(node);
    }
  });

  it("finds a node that sits on a cell boundary", () => {
    const nodes = [{ id: "n1", x: 65, y: 65 }];
    const grid = buildGrid(nodes);

    expect(queryCell(grid, 66, 66, nodes)?.id).toBe("n1");
  });
});

describe("union-find", () => {
  it("gives merged nodes the same root", () => {
    const uf = createUnionFind(["a", "b", "c", "d"]);
    uf.union("a", "b");

    expect(uf.find("a")).toBe(uf.find("b"));
  });

  it("keeps the component count stable", () => {
    const uf = createUnionFind(["a", "b", "c", "d"]);
    uf.union("a", "b");
    uf.union("c", "d");

    expect(uf.components()).toBe(2);
  });
});
\`;

document.getElementById("run-btn").addEventListener("click", runSuite);

document.getElementById("file-btn").addEventListener("click", () => {
  fileEl.hidden = !fileEl.hidden;
  fileEl.textContent = VITEST_FILE;
});

runSuite();
console.log("invariant suite ready — install vitest to run it on every change");`
	}
};
