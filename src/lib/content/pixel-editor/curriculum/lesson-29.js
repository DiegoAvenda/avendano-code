// Pixel Art Editor — Lesson 29: Project Close — Definition of Done
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 29,
	title: 'Project Close: Definition of Done',
	description: `A project does not end when the last feature works. It ends when you can answer, with evidence, a short list of questions. That list is the same for every project in this course:

\`\`\`
1. Reproducible        it installs and runs from a clean checkout
2. Tests               the core logic is covered and green
3. Static quality      lint and types pass
4. Measurement         the critical path has real numbers
5. Resource audit      listeners, timers, DOM nodes are released
6. Decisions           the README explains the trade-offs
\`\`\`

Some of those can be checked by a machine, and this lesson automates exactly those: it runs the tests from Lesson 26, the resource audit from Lesson 28, and a real measurement. The rest are judgements — you mark them, but the report tells you which ones are still open.

The interesting part is not the checklist itself. It is that **the same checklist closes every module**, and what changes is the standard you apply. In the React module, "resource audit" will mean effects and subscriptions; in Next.js, caches and server lifetimes. The list stays; the bar rises.`,
	task: `1. Press **Run the checklist** and read the report — the three automatic checks run for real.
2. Look at \`checkResources\`: it mounts a panel, destroys it, and compares the resource counts before and after.
3. Mark the manual items one by one and run again: the verdict only changes when every item passes.
4. Find a manual item you cannot honestly mark yet — that is your next task, not a formality.
5. Apply the same list to a project of your own and see which items you cannot answer with evidence.`,
	concept: `**Definition of Done** — a short, fixed checklist that every project must satisfy before it is considered finished, where each item is answered with evidence (a test, a number, an audit) rather than with an opinion.`,
	whyItMatters: `This is the difference between "it works on my machine" and "I can show you why it is finished". And because the list is fixed and short, it travels: the same six questions will close the diagram builder, the React app and the Next.js app, each time with a higher standard.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 29</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — Definition of Done</h3>
  <div id="checklist">
    <label class="check-row"><input type="checkbox" id="check-repro" /> Installs and runs from a clean checkout</label>
    <label class="check-row"><input type="checkbox" id="check-lint" /> Lint and types are green</label>
    <label class="check-row"><input type="checkbox" id="check-docs" /> Decisions and trade-offs documented</label>
    <label class="check-row"><input type="checkbox" id="check-a11y" /> Main flow works with the keyboard</label>
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
#checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 520px;
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
  font-size: 12.5px;
  line-height: 1.8;
  color: #b0b0c8;
  white-space: pre-wrap;
  width: 620px;
  max-width: 100%;
  min-height: 240px;
}`,
		javascript: `// Pixel Art Editor — Lesson 29: Project Close: Definition of Done

const reportEl = document.getElementById("report");

// ── Automatic check 1: the core logic still passes its tests ──
function checkTests() {
  let passed = 0;
  let total = 0;

  function expectEqual(actual, expected) {
    total++;
    if (JSON.stringify(actual) === JSON.stringify(expected)) passed++;
  }

  const indexOf = (x, y, width) => y * width + x;
  expectEqual(indexOf(0, 0, 4), 0);
  expectEqual(indexOf(3, 0, 4), 3);
  expectEqual(indexOf(0, 1, 4), 4);

  return {
    ok: passed === total,
    detail: passed + "/" + total + " assertions pass"
  };
}

// ── Automatic check 2: the resource audit from Lesson 28 ──
const live = { listeners: 0, timers: 0 };

function snapshot() {
  return JSON.stringify(live);
}

function mountPanel() {
  const controller = new AbortController();
  window.addEventListener("resize", () => {}, { signal: controller.signal });
  live.listeners++;
  const timer = setTimeout(() => {}, 5000);
  live.timers++;

  return {
    destroy() {
      controller.abort();
      clearTimeout(timer);
      live.listeners--;
      live.timers--;
    }
  };
}

function checkResources() {
  const before = snapshot();
  mountPanel().destroy();
  const after = snapshot();

  return {
    ok: before === after,
    detail: before === after ? "mount/unmount leaves nothing behind" : "resources survived destroy()"
  };
}

// ── Automatic check 3: the critical path has real numbers ──
function checkMeasurement() {
  const ITERATIONS = 200000;
  const start = performance.now();
  let sink = 0;
  for (let i = 0; i < ITERATIONS; i++) sink += i % 7;
  const ms = performance.now() - start;

  return {
    ok: Number.isFinite(ms),
    detail: ITERATIONS.toLocaleString() + " iterations in " + ms.toFixed(2) + " ms (sink " + sink + ")"
  };
}

// ── Manual items: judgements the machine cannot make ──
const MANUAL = [
  { id: "check-repro", label: "Reproducible from a clean checkout" },
  { id: "check-lint", label: "Lint and types pass" },
  { id: "check-docs", label: "Decisions documented" },
  { id: "check-a11y", label: "Main flow works with the keyboard" }
];

document.getElementById("run-btn").addEventListener("click", () => {
  const results = [
    { label: "Tests", ...checkTests() },
    { label: "Resource audit", ...checkResources() },
    { label: "Measurement", ...checkMeasurement() }
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

  console.log("Definition of Done:", done + "/" + results.length);
});

console.log("Checklist ready — run it against the project you built");`
	}
};
