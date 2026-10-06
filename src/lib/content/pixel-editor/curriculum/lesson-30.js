// Pixel Art Editor — Lesson 30: Project Close: Definition of Done
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 30,
	title: 'Project Close: Definition of Done',
	description: `Every project in this course ends with the same question, asked at different levels of rigour: **can you show that this is finished?**

Right now you have no tooling. No npm scripts, no linter, no test runner — everything has to be verified by hand, in the browser. So the checklist for this module is small and honest:

\`\`\`
1. Clean console       no uncaught errors while the editor runs
2. Pure logic by hand  the index math and the structures, checked with your own assertions
3. Resource audit      timers and listeners are released
\`\`\`

That is deliberately all of it. There is no CI, no automated lint, no report: the evidence is what you can run and read yourself in this page. The checklist is not weaker for that — it is the honest version of "done" for the tools you have.

The bar is what changes later. In Module 1 the same intent — evidence, not opinions — is met with a real local toolchain: Vitest for the invariant suite, ESLint and Prettier to keep the code clean.`,
	task: `1. Press **Run the checklist** and read the three items.
2. Press **Break it**: it throws an intentional error and leaves a timer nobody releases.
3. Watch the checklist go red — and watch the console fill up. That first item is doing its job.
4. Reload the page to fix it, and confirm the three items are green again.
5. Ask what a linter or a test runner would have caught *without you looking*.`,
	concept: `**A Definition of Done proportional to your tools** — the checklist is evidence, not ceremony. When there is no tooling, the evidence is manual, and that is still evidence.`,
	whyItMatters: `It is tempting to skip verification when nothing automates it. This lesson makes the manual version explicit and makes the gap visible: everything here is checked by hand, by you, in the browser, and only while you remember to look. The next module closes exactly that gap.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 30</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — Definition of Done (manually verified)</h3>
  <div id="toolbar">
    <button id="run-btn">Run the checklist</button>
    <button id="break-btn">Break it</button>
  </div>
  <pre id="report">Run the checklist to see the three items.</pre>
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
#toolbar { display: flex; gap: 8px; }
#run-btn, #break-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover { border-color: #2ecc71; }
#break-btn:hover { border-color: #e94560; }
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
  width: 640px;
  max-width: 100%;
  min-height: 260px;
}`,
		javascript: `// Pixel Art Editor — Lesson 30: Project Close: Definition of Done

const reportEl = document.getElementById("report");

// ── Item 1: a clean console ──
// Nothing automates this yet, so we count uncaught errors ourselves.
let uncaught = 0;
window.addEventListener("error", () => { uncaught++; });
window.addEventListener("unhandledrejection", () => { uncaught++; });

function checkConsole() {
  return {
    ok: uncaught === 0,
    detail: uncaught === 0 ? "no uncaught errors" : uncaught + " uncaught error(s)"
  };
}

// ── Item 2: pure logic, checked by hand ──
// The same assertions a test runner would execute — written manually.
function checkPureLogic() {
  let passed = 0;
  let total = 0;

  const expectEqual = (actual, expected) => {
    total++;
    if (JSON.stringify(actual) === JSON.stringify(expected)) passed++;
  };

  const indexOf = (x, y, width) => y * width + x;
  expectEqual(indexOf(0, 0, 4), 0);
  expectEqual(indexOf(3, 0, 4), 3);
  expectEqual(indexOf(0, 1, 4), 4);

  return { ok: passed === total, detail: passed + "/" + total + " assertions pass" };
}

// ── Item 3: the resource audit ──
const live = { listeners: 0, timers: 0 };
const baseline = JSON.stringify(live); // everything must come back to this

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
  mountPanel().destroy();
  const now = JSON.stringify(live);

  return {
    ok: now === baseline,
    detail: now === baseline ? "timers and listeners released" : "something leaked: " + now
  };
}

// ── The checklist ──
function runChecklist() {
  const results = [
    { label: "Clean console", ...checkConsole() },
    { label: "Pure logic by hand", ...checkPureLogic() },
    { label: "Resource audit", ...checkResources() }
  ];

  const done = results.filter((result) => result.ok).length;
  const lines = results.map(
    (result) => (result.ok ? "✓ " : "✗ ") + result.label + " — " + result.detail
  );

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" +
    done + " of " + results.length + " checks pass — " +
    (done === results.length ? "DONE" : "NOT DONE") +
    "\\n\\nthe whole checklist is manual: no linter, no test runner,\\n" +
    "no CI. Right now you are the automation.";

  console.log("Definition of Done (manual):", done + "/" + results.length);
}

document.getElementById("run-btn").addEventListener("click", runChecklist);

// Break it on purpose: an uncaught error and a timer nobody releases.
document.getElementById("break-btn").addEventListener("click", () => {
  setTimeout(() => {
    throw new Error("Intentional: this is what a dirty console looks like");
  }, 0);

  live.timers++;
  setTimeout(() => {}, 60000); // never cleaned up

  reportEl.textContent =
    "broke it: one uncaught error and one leaked timer.\\n" +
    "Check the console, then run the checklist again.";

  // The error is asynchronous, so inspect right after it has fired.
  setTimeout(runChecklist, 60);
});

runChecklist();`
	}
};
