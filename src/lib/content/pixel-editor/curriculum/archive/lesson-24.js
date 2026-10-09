// Pixel Art Editor — Lesson 24: Add Types
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 24,
	title: 'Add Types',
	description: `We documented the shape of a node, and we wrote guards — by hand, everywhere. The open question from the previous lesson was: **can the computer check this for us before the program runs?**

That is exactly what TypeScript does. It is a static type checker for JavaScript: you describe the shape once, and the tool checks every use of it without executing anything.

\`\`\`
interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

function moveNode(node: Node, x: number, y: number): Node { … }
\`\`\`

With that contract in place, the editor can mark \`node.lable\` **before you run the code**, and \`moveNode(node, "100", 200)\` is not a runtime mystery any more: it is an error pointing at the argument.

The important part is the direction of the work: we did not start from the syntax. We started from a real failure, tried JavaScript's own tools, and only then added types.`,
	task: `1. Press **Check, then run**. The checker runs *before* any code executes.
2. Compare the output with the previous two lessons: same three mistakes, now reported as static errors with the property or argument named.
3. Look at \`checkShape\` — it is a miniature version of what a type checker does with \`interface Node\`.
4. Press **Skip the check** to see the program run anyway, with the failures we already know.
5. Ask: which of the two runs would you rather debug?`,
	concept: `**Static type checking** — describing the shape of values with annotations and interfaces so a tool can find type errors before the program runs, instead of discovering them later at runtime.`,
	whyItMatters: `Types are not extra syntax you must memorise: they are the answer to a problem you have now experienced twice. And because they are checked statically, they can be verified in CI, in your editor and before a deploy — the failure never reaches the user.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 24</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Add types — or at least check them</h3>
  <div id="controls">
    <button id="check-btn">Check, then run</button>
    <button id="skip-btn">Skip the check</button>
  </div>
  <pre id="report">Press a button to compare static checks with runtime failures.</pre>
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
#check-btn, #skip-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#check-btn:hover, #skip-btn:hover { border-color: #8b8bcc; }
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
		javascript: `// Pixel Art Editor — Lesson 24: Add Types

const reportEl = document.getElementById("report");

// A miniature type checker: the shape of "Node", described once.
const NODE_SHAPE = {
  id: "string",
  x: "number",
  y: "number",
  label: "string"
};

function checkShape(value, shape, name) {
  const errors = [];

  for (const [key, expected] of Object.entries(shape)) {
    const actual = typeof value[key];
    if (actual !== expected) {
      errors.push(name + "." + key + " should be " + expected + ", found " + actual);
    }
  }

  for (const key of Object.keys(value)) {
    if (!(key in shape)) {
      errors.push(name + "." + key + " does not exist on type Node");
    }
  }

  return errors;
}

// The program we already wrote twice — with one line that reads a typo.
function program(node) {
  const lines = [];
  lines.push("connectNode → " + node.id.toUpperCase());
  lines.push("label → " + node.lable);
  lines.push("distance → " + (node.x + 50));
  return lines;
}

const goodNode = { id: "a1", x: 100, y: 200, label: "Start" };
const badNode = { id: "b2", x: "100", y: 200, lable: "Start" };

document.getElementById("check-btn").addEventListener("click", () => {
  const errors = [
    ...checkShape(badNode, NODE_SHAPE, "node"),
    "node.lable does not exist on type Node"
  ];

  reportEl.textContent =
    "1. static check (nothing has run yet)\\n\\n" +
    errors.map((error) => "  ✗ " + error).join("\\n") +
    "\\n\\n2. result\\n" +
    "  compile failed — the bad program was never executed.";

  console.log("Static errors:", errors);
});

document.getElementById("skip-btn").addEventListener("click", () => {
  const output = program(badNode);

  reportEl.textContent =
    "1. static check skipped\\n\\n" +
    "2. runtime\\n" +
    output.map((line) => "  " + line).join("\\n") +
    "\\n\\n  undefined, \\"10050\\" and a typo —\\n" +
    "  exactly the failures from the previous lessons.";

  console.log("Runtime output:", output);
});

console.log("Checker ready for", Object.keys(NODE_SHAPE).join(", "));`
	}
};
