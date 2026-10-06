// Pixel Art Editor — Lesson 25: Make the Contract Useful
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 25,
	title: 'Make the Contract Useful',
	description: `Types are not only about protecting variables. Their real value appears at the **boundaries between parts of the program**: rendering, tools, editor state.

Two type ideas do most of that work.

**Unions** describe a value that can be exactly one of a known set:

\`\`\`
type Tool = "pencil" | "eraser" | "bucket";
type EditorState =
  | { kind: "idle" }
  | { kind: "drawing"; stroke: number[] }
  | { kind: "filling"; region: number[] };
\`\`\`

**Optional properties** describe what may be absent:

\`\`\`
interface Node { id: string; x: number; y: number; label?: string }
\`\`\`

With those in place, impossible states stop being possible: a tool can only be one of three strings, a state can only be \`idle\`, \`drawing\` or \`filling\`, and the compiler makes you handle every case.`,
	task: `1. Press **Run the state machine** and follow the log: each state transition is checked against the union.
2. Press **Try an impossible state** — \`kind: "exporting"\` is not part of the union, so it is rejected before anything runs.
3. Try setting the tool to \`"spray"\` and see the union reject it.
4. Notice the optional \`label\`: the code checks for its absence before using it.
5. Find the \`default\` branch in \`describe\`. Its only job is to make a new state impossible to forget in a real type checker.`,
	concept: `**Unions, optional properties and discriminated unions** — describing exactly which values are legal, so the compiler can prove that every case is handled and impossible states are rejected.`,
	whyItMatters: `This is where types start modelling the domain instead of only the variables. A tool that can be "pencil | eraser | bucket" cannot silently become "spray"; a drawing state cannot be confused with a filling state. The contract now protects the design of the editor itself.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 25</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Make the contract useful</h3>
  <div id="controls">
    <button id="run-btn">Run the state machine</button>
    <button id="bad-btn">Try an impossible state</button>
  </div>
  <pre id="report">Press Run to walk through the editor states.</pre>
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
		javascript: `// Pixel Art Editor — Lesson 25: Make the Contract Useful

const reportEl = document.getElementById("report");

// ── Unions: a value that can be exactly one of these ──
const TOOLS = ["pencil", "eraser", "bucket"];
const STATE_KINDS = ["idle", "drawing", "filling"];

function checkTool(tool) {
  if (!TOOLS.includes(tool)) {
    throw new TypeError(
      'Tool must be "pencil" | "eraser" | "bucket", received ' + JSON.stringify(tool)
    );
  }
  return tool;
}

function checkState(state) {
  if (!STATE_KINDS.includes(state.kind)) {
    throw new TypeError(
      'EditorState.kind must be "idle" | "drawing" | "filling", received ' +
        JSON.stringify(state.kind)
    );
  }
  if (state.kind === "drawing" && !Array.isArray(state.stroke)) {
    throw new TypeError("A drawing state must carry a stroke array");
  }
  if (state.kind === "filling" && !Array.isArray(state.region)) {
    throw new TypeError("A filling state must carry a region array");
  }
  return state;
}

// ── Optional properties: label may simply not be there ──
function describeNode(node) {
  const label = node.label === undefined ? "(no label)" : node.label;
  return "#" + node.id + " " + label;
}

// ── The state machine ──
function describe(state) {
  checkState(state);

  switch (state.kind) {
    case "idle":
      return "idle — waiting for input";
    case "drawing":
      return "drawing a stroke of " + state.stroke.length + " pixels";
    case "filling":
      return "filling a region of " + state.region.length + " pixels";
    default:
      // In TypeScript this branch is unreachable: every member is handled.
      throw new Error("Unhandled state: " + state.kind);
  }
}

document.getElementById("run-btn").addEventListener("click", () => {
  const lines = [];

  lines.push("tool = " + checkTool("pencil"));
  lines.push(describe({ kind: "idle" }));
  lines.push(describe({ kind: "drawing", stroke: [12, 13, 14, 15] }));
  lines.push(describe({ kind: "filling", region: [1, 2, 3] }));
  lines.push("node " + describeNode({ id: "a1", x: 10, y: 20, label: "Start" }));
  lines.push("node " + describeNode({ id: "b2", x: 30, y: 40 }));

  reportEl.textContent =
    "every transition checked against the union\\n\\n" +
    lines.map((line) => "  ✓ " + line).join("\\n") +
    "\\n\\nthe union only allows idle | drawing | filling,\\n" +
    "and label is allowed to be absent.";

  console.log(lines.join("\\n"));
});

document.getElementById("bad-btn").addEventListener("click", () => {
  const attempts = [
    () => checkTool("spray"),
    () => describe({ kind: "exporting" }),
    () => checkState({ kind: "drawing" })
  ];

  const lines = attempts.map((attempt) => {
    try {
      attempt();
      return "  ✓ accepted (this should not happen)";
    } catch (error) {
      return "  ✗ " + error.message;
    }
  });

  reportEl.textContent =
    "impossible states rejected before running\\n\\n" +
    lines.join("\\n") +
    "\\n\\nthese are not runtime surprises: they are\\n" +
    "type errors the compiler catches for you.";

  console.log(lines.join("\\n"));
});`
	}
};
