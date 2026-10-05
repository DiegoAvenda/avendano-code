// Lesson 25 — When Types Meet Reuse
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 25,
	title: 'When Types Meet Reuse',
	description: `The last question is a reuse question: **what if the same logic has to work with different types of data?**

Undo history stores points, the palette stores colors, the diagram stores nodes. A function like "give me the first item" does not care what the items are:

\`\`\`
function first<T>(items: T[]): T
\`\`\`

The \`T\` is a **type parameter**: a placeholder that the caller fills in. When you call \`first(numbers)\` the result is a \`number\`; when you call \`first(nodes)\` the result is a \`Node\`. The logic is written once and the type information is preserved at every call site:

\`\`\`
first([1, 2, 3])        → number
first(["a", "b"])       → string
first([node1, node2])   → Node   (so node1.id is still checked)
\`\`\`

Generics appear here for the same reason everything else appeared: a real problem — reuse without losing the contract — not as abstract syntax to memorise.`,
	task: `1. Press **Run**. \`first\` is called with numbers, strings and node objects.
2. Look at the log: the same function keeps the type of whatever it received.
3. Find \`last\` — a second generic function reusing the same idea.
4. Press **Show the wrong call**: \`first(items)\` on a non-array is rejected, and an object without \`id\` is flagged where it is used.
5. Ask yourself the closing question of the module: which parts of your own project would benefit from a contract, and which are better left flexible?`,
	concept: `**Generics** — functions and structures parameterised by a type, so logic is written once while the type information travels with the data and is still checked at every call site.`,
	whyItMatters: `Generic code is how a small, reusable core stays type-safe as a project grows. It closes the TypeScript bridge: you now have types, interfaces, unions, optional properties and generics — each one introduced by a problem you felt first.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 25</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>When types meet reuse — generics</h3>
  <div id="controls">
    <button id="run-btn">Run</button>
    <button id="bad-btn">Show the wrong call</button>
  </div>
  <pre id="report">Press Run to reuse one function across three types.</pre>
  <script src="script.js"></script>
</body>
</html>`,
		css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}
h3 { font-size: 14px; opacity: 0.7; }
#controls { display: flex; gap: 8px; }
#run-btn, #bad-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover, #bad-btn:hover { border-color: #8b8bcc; }
#report {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.8;
  color: #b0b0c8;
  white-space: pre;
  min-width: 620px;
}`,
		javascript: `// Pixel Art Editor — Lesson 25: When Types Meet Reuse

const reportEl = document.getElementById("report");

// Generic in spirit: "give me the first item of a list of T".
// function first<T>(items: T[]): T
function first(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("first(expected T[], received " + typeof items + ")");
  }
  if (items.length === 0) return undefined;
  return items[0];
}

// A second reuse of the same idea: the top of a bounded stack.
// function last<T>(items: T[]): T | undefined
function last(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("last(expected T[], received " + typeof items + ")");
  }
  return items[items.length - 1];
}

// A tiny generic container, used the same way for frame times or for nodes.
function createBuffer(capacity) {
  const items = [];
  return {
    push(item) {
      items.push(item);
      if (items.length > capacity) items.shift();
    },
    first: () => first(items),
    last: () => last(items),
    get size() { return items.length; }
  };
}

function describe(value) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array(" + value.length + ")";
  return typeof value + " · " + JSON.stringify(value);
}

document.getElementById("run-btn").addEventListener("click", () => {
  const numbers = [10, 20, 30];
  const strings = ["pencil", "eraser", "bucket"];
  const nodes = [
    { id: "a1", x: 100, y: 200 },
    { id: "b2", x: 40, y: 90 }
  ];

  const history = createBuffer(100);
  history.push({ id: "a1", x: 100, y: 200 });
  history.push({ id: "b2", x: 40, y: 90 });

  const lines = [
    "first([10, 20, 30])        → " + describe(first(numbers)),
    "first([\\"pencil\\", …])       → " + describe(first(strings)),
    "first([node1, node2])      → " + describe(first(nodes)),
    "last([10, 20, 30])         → " + describe(last(numbers)),
    "buffer.last()              → " + describe(history.last()),
    "buffer.first().id          → " + (history.first() ? history.first().id : "n/a")
  ];

  reportEl.textContent =
    "one function, three types — the type travels with the value\\n\\n" +
    lines.map((line) => "  " + line).join("\\n") +
    "\\n\\nwith generics the compiler keeps the type at every\\n" +
    "call site, so node.id is still checked.";

  console.log(lines.join("\\n"));
});

document.getElementById("bad-btn").addEventListener("click", () => {
  const lines = [];

  try {
    first("not an array");
    lines.push("  ✓ accepted (this should not happen)");
  } catch (error) {
    lines.push("  ✗ " + error.message);
  }

  lines.push("  ✗ property 'lable' does not exist on type Node");
  lines.push("  ✗ Argument of type 'string' is not assignable to parameter of type 'number'");

  reportEl.textContent =
    "the contract still applies inside generic code\\n\\n" +
    lines.join("\\n") +
    "\\n\\nreuse without losing the type information:\\n" +
    "that is what generics are for.";

  console.log(lines.join("\\n"));
});`
	}
};
