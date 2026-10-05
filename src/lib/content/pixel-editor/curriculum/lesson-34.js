// Diagram Builder — Lesson 34: Testing the Structures
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 34,
	title: 'Testing the Structures',
	description: `The diagram editor now rests on three data structures we chose for three different access patterns:

\`\`\`
Map            find a node by id            O(1)
spatial grid   find nodes near a point      one bucket instead of all
union-find     are these two connected?     near O(1)
\`\`\`

They are also the code most likely to break silently. A wrong bucket key does not throw; it just returns the wrong node, or none, and the canvas looks almost right.

That is exactly what tests are for. But structures are not tested one example at a time — they are tested with **invariants**: properties that must hold for every input.

\`\`\`
every node in a bucket is inside that bucket's cell
find() of an unknown id returns undefined, never a wrong node
after union(a, b): find(a) === find(b)
after a rebuild, the component count matches a fresh computation
\`\`\`

Invariants catch the failures that examples miss: the node that falls exactly on a cell boundary, the connection that merges two groups that were already merged, the query outside the canvas.`,
	task: `1. Press **Run tests** — the harness from the first module comes back, now testing the diagram's structures.
2. Read the boundary test: a node exactly on a cell edge must still be found.
3. Read the invariant test for the grid: it checks **every** node against the cell it was filed under, not just one.
4. Read the union-find tests: merging, idempotence (merging twice changes nothing) and the component count after a rebuild.
5. Add a failing test on purpose: what happens if you query a point outside the canvas?`,
	concept: `**Invariant-based tests** — instead of checking one input and one output, state a property that must hold for every input and let the test walk the data checking it.`,
	whyItMatters: `These three structures are what make the editor scale, and they are also the ones whose bugs are invisible on screen. When the project closes, this suite is the evidence that "the structures work" is a fact and not an impression — and it is the same evidence the Definition of Done asks for.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 34</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Diagram Builder — testing the structures</h3>
  <div id="toolbar">
    <button id="run-btn">Run tests</button>
    <button id="fail-btn">Add a failing test</button>
  </div>
  <pre id="report">Press Run tests.</pre>
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
#run-btn, #fail-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover, #fail-btn:hover { border-color: #8b8bcc; }
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
  min-height: 300px;
}`,
		javascript: `// Diagram Builder — Lesson 34: Testing the Structures

const reportEl = document.getElementById("report");

let passed = 0;
let failed = 0;
let lines = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    lines.push("✓ " + name);
  } catch (error) {
    failed++;
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
    toEqual(expected) {
      const got = JSON.stringify(actual);
      const want = JSON.stringify(expected);
      if (got !== want) throw new Error("expected " + want + ", received " + got);
    }
  };
}

// ── The three structures, exactly as the lessons built them ──
const NODES = [
  { id: "n1", x: 10, y: 10 },
  { id: "n2", x: 70, y: 20 },
  { id: "n3", x: 65, y: 65 },
  { id: "n4", x: 130, y: 130 }
];

const nodesById = new Map(NODES.map((node) => [node.id, node]));

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

function queryCell(x, y) {
  const bucket = grid.get(cellKey(x, y)) || [];
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
  const roots = new Set(NODES.map((node) => find(node.id)));
  return roots.size;
}

function runTests() {
  passed = 0;
  failed = 0;
  lines = [];

  // Map index
  test("the index finds a node by id", () => {
    expect(nodesById.get("n3")).toBe(NODES[2]);
  });

  test("an unknown id returns undefined, never a wrong node", () => {
    expect(nodesById.get("n99")).toBeUndefined();
  });

  // Spatial grid
  test("a point inside a node finds that node", () => {
    expect(queryCell(12, 12).id).toBe("n1");
  });

  test("a point on a cell boundary still finds its node", () => {
    expect(queryCell(66, 66).id).toBe("n3");
  });

  test("a point with no node returns undefined", () => {
    expect(queryCell(500, 500)).toBeUndefined();
  });

  test("every node is filed under the cell that contains it", () => {
    for (const node of NODES) {
      const bucket = grid.get(cellKey(node.x, node.y));
      if (!bucket || !bucket.includes(node)) {
        throw new Error(node.id + " is not in the bucket for its own cell");
      }
    }
  });

  // Union-find
  test("after union(a, b), both share a root", () => {
    rebuild([]);
    union("n1", "n2");
    expect(find("n1")).toBe(find("n2"));
  });

  test("merging the same pair twice changes nothing", () => {
    rebuild([]);
    const first = union("n1", "n2");
    const second = union("n1", "n2");
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(componentCount()).toBe(3);
  });

  test("connected nodes end up in one component", () => {
    rebuild([
      ["n1", "n2"],
      ["n2", "n3"]
    ]);
    expect(componentCount()).toBe(2);
  });

  test("a rebuild after removing an edge splits the component again", () => {
    rebuild([
      ["n1", "n2"],
      ["n2", "n3"]
    ]);
    expect(componentCount()).toBe(2);
    rebuild([["n1", "n2"]]);
    expect(componentCount()).toBe(3);
  });

  reportEl.textContent = lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";
  console.log("structure tests:", passed, "passed,", failed, "failed");
}

document.getElementById("run-btn").addEventListener("click", runTests);

// A failing test on purpose: a query outside the canvas has no answer.
document.getElementById("fail-btn").addEventListener("click", () => {
  runTests();
  test("a point far outside the canvas returns the nearest node", () => {
    expect(queryCell(1000, 1000)).toBe(NODES[3]);
  });
  reportEl.textContent = lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";
});

runTests();`
	}
};
