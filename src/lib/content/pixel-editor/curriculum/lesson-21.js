// Lesson 21 — JavaScript Starts Fighting Back
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 21,
	title: 'JavaScript Starts Fighting Back',
	description: `The editor now has real data: a diagram node with an id, a position and a label.

\`\`\`
const node = { id: "a1", x: 100, y: 200, label: "Start" };
\`\`\`

Several parts of the program use it:

\`\`\`
function connectNode(node) { /* … */ }
function moveNode(node, x, y) { /* … */ }
\`\`\`

And then the mistakes start. They are not exotic; they are the ones everybody makes:

\`\`\`
node.lable              // a typo
moveNode(node, "100", 200)   // a string where a number was expected
moveNode({ id: "b2", x: 10 })  // a node without y
\`\`\`

JavaScript runs all three. Nothing crashes at the place where the mistake is. Instead the value travels through the program and the failure appears later — as \`undefined\`, as \`NaN\`, or as a number that quietly became a string.

That delay is the real problem: the further the failure is from its cause, the harder it is to find.`,
	task: `1. Press **Run the mistakes** and read the report — each row shows the call, the value it produced and when the problem surfaces.
2. Find the three failure modes: a misspelled property, a value with the wrong type, and a missing property.
3. Notice that nothing throws. The program keeps running with bad data.
4. Add \`console.log(node)\` after each call to see how the object changed.
5. Write down the question this leaves open: could the computer detect this *before* running the program?`,
	concept: `**Runtime-only checking** — JavaScript validates values while the program runs, so a mismatch is discovered when the bad value is finally used, not where it was introduced.`,
	whyItMatters: `This is not an argument against JavaScript; it is the description of a real limitation. Once you have felt the distance between cause and symptom, the next lessons have an obvious purpose: moving the detection earlier.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 21</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>JavaScript starts fighting back</h3>
  <div id="controls">
    <button id="run-btn">Run the mistakes</button>
  </div>
  <pre id="report">Press Run to send three bad values through the program.</pre>
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
		javascript: `// Pixel Art Editor — Lesson 21: JavaScript Starts Fighting Back

const reportEl = document.getElementById("report");

const node = { id: "a1", x: 100, y: 200, label: "Start" };

function connectNode(target) {
  return target.id.toUpperCase() + " connected at " + target.x + "," + target.y;
}

function moveNode(target, x, y) {
  target.x = x;
  target.y = y;
  return target;
}

function drawLink(from, to) {
  // distance between two nodes
  return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
}

document.getElementById("run-btn").addEventListener("click", () => {
  const rows = [];

  // 1. A typo in a property name
  const typo = node.lable;
  rows.push(
    "node.lable\\n" +
    "  value      : " + String(typo) + "\\n" +
    "  problem    : undefined — no error, no warning\\n" +
    "  surfaces   : when something finally reads .label"
  );

  // 2. The right value with the wrong type
  moveNode(node, "100", 200);
  const distance = drawLink(node, { x: 160, y: 200 });
  rows.push(
    "moveNode(node, \\"100\\", 200)\\n" +
    "  node.x     : " + JSON.stringify(node.x) + "  (" + typeof node.x + ")\\n" +
    "  node.x + 10: " + JSON.stringify(node.x + 10) + "\\n" +
    "  distance   : " + distance + "\\n" +
    "  problem    : the string travelled into the maths"
  );

  // 3. A node that is missing a property
  const incomplete = { id: "b2", x: 10 };
  moveNode(incomplete, 10, 50);
  const gap = drawLink(incomplete, { x: 40, y: 90 });
  rows.push(
    "moveNode({ id: \\"b2\\", x: 10 }, 10, 50)\\n" +
    "  node.y     : " + String(incomplete.y) + "\\n" +
    "  distance   : " + gap + "\\n" +
    "  problem    : NaN — a missing value became a number"
  );

  reportEl.textContent = rows.join("\\n\\n") +
    "\\n\\nthree mistakes, three delayed symptoms,\\nzero messages pointing at the cause.";

  console.log("node after the mistakes:", node);
  console.log("NaN distance:", gap);
});`
	}
};
