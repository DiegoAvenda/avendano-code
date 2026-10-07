// Pixel Art Editor — Lesson 23: Contracts Without TypeScript
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 23,
	title: 'Contracts Without TypeScript',
	description: `We know the failures now, so let's try to catch them **without** changing languages. JavaScript already gives us a few tools:

- **conventions** — "a node always has an id, an x and a y"
- **runtime validations** — check the value before using it and throw a clear error
- **comments and JSDoc** — document what a function expects, so the editor can show it

\`\`\`
/**
 * @param {{ id: string, x: number, y: number, label: string }} node
 */
function moveNode(node, x, y) { … }
\`\`\`

This genuinely works. But look at what it costs:

\`\`\`
function moveNode(node, x, y) {
  assertNode(node);
  assertNumber(x);
  assertNumber(y);
  // …now the actual three lines of logic
}
\`\`\`

The contracts are maintained by hand, by us, everywhere, forever. Every new field means updating the validators, the JSDoc and the tests — and nothing forces a caller to read any of it. **TypeScript** — JavaScript with labels for your data, so mistakes are caught before the user sees them — is the next lesson's answer; here we do without it.`,
	task: `1. Read the three contract tools: the JSDoc annotation, \`assertNumber\` and \`assertNode\`.
2. Press **Run with contracts** — the same three mistakes from the previous lesson are now caught with a message that names the cause.
3. Read the error messages: they point at the argument that was wrong.
4. Count the lines: contracts vs actual logic.
5. Now change the node shape (add \`label\` as required) and see how many places you have to update by hand.`,
	concept: `**Manual contracts** — JSDoc plus runtime guards make expectations explicit and catch bad values early, at the price of writing and maintaining the checks yourself.`,
	whyItMatters: `This is the best JavaScript can do without a compiler's help, and it already improves the situation. The remaining discomfort is the point: the checks are written by hand, the documentation can drift from the code, and the computer still cannot prove that every caller respects the contract. That is the question the next lesson answers.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 23</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Contracts without TypeScript</h3>
  <div id="controls">
    <button id="run-btn">Run with contracts</button>
  </div>
  <pre id="report">Press Run to send the same bad values, now through guards.</pre>
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
#run-btn {
  background: #2a2a44;
  color: #e0e0e0;
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
  font-size: 12px;
  line-height: 1.8;
  color: #b0b0c8;
  white-space: pre;
  min-width: 600px;
}`,
		javascript: `// Pixel Art Editor — Lesson 23: Contracts Without TypeScript

const reportEl = document.getElementById("report");

// ── The contract, written by hand ──
function assertNumber(value, name) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(name + " must be a number, received " + JSON.stringify(value));
  }
}

function assertNode(value, name) {
  if (value === null || typeof value !== "object") {
    throw new TypeError(name + " must be an object");
  }
  if (typeof value.id !== "string") {
    throw new TypeError(name + ".id must be a string");
  }
  assertNumber(value.x, name + ".x");
  assertNumber(value.y, name + ".y");
}

function validateNode(value, name) {
  if (typeof value.label !== "string") {
    throw new TypeError(name + ".label must be a string");
  }
}

/**
 * @param {{ id: string, x: number, y: number, label: string }} node
 * @param {number} x
 * @param {number} y
 */
function moveNode(node, x, y) {
  assertNode(node, "node");
  assertNumber(x, "x");
  assertNumber(y, "y");

  node.x = x;
  node.y = y;
  return node;
}

function guard(label, fn) {
  try {
    fn();
    return label + "\\n  ok";
  } catch (error) {
    return label + "\\n  " + error.name + ": " + error.message;
  }
}

document.getElementById("run-btn").addEventListener("click", () => {
  const node = { id: "a1", x: 100, y: 200, label: "Start" };
  const rows = [];

  rows.push(guard("moveNode(node, \\"100\\", 200)", () => moveNode(node, "100", 200)));
  rows.push(guard("moveNode({ id: \\"b2\\", x: 10 }, 10, 50)", () =>
    moveNode({ id: "b2", x: 10 }, 10, 50)
  ));
  rows.push(guard("validateNode({ id: \\"c3\\", x: 1, y: 2 })", () =>
    validateNode({ id: "c3", x: 1, y: 2 }, "node")
  ));
  rows.push(guard("moveNode(node, 120, 240)  // valid", () => moveNode(node, 120, 240)));

  reportEl.textContent = rows.join("\\n\\n") +
    "\\n\\ncontract code: 18 lines\\nlogic in moveNode: 3 lines";

  console.log("node after the valid call:", node);
});`
	}
};
