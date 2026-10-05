// Pixel Art Editor — Lesson 28: Memory I: Lifetime & Cleanup
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 28,
	title: 'Memory I: Lifetime & Cleanup',
	description: `This editor has been creating resources since Lesson 8, and we never asked who releases them:

\`\`\`
object created
      ↓
resource attached   (a listener, a timer, an interval, a DOM node)
      ↓
object removed from the page
      ↓
resource still alive
      ↓
memory leak
\`\`\`

The real code is already full of these moments:

| Where | Resource | Who should release it |
|---|---|---|
| \`Playground.svelte\` | the debounced save timer | \`onDestroy\`, flushing the pending save |
| \`Preview.svelte\` | \`window.addEventListener("message")\` | the cleanup returned by \`onMount\` |
| \`CodeEditor.svelte\` | the CodeMirror view | \`onDestroy\` → \`view.destroy()\` |
| \`Console.svelte\` | the auto-scroll effect | the effect's teardown |

None of that is exotic. It is the same pattern every time: **the resource's lifetime must not outlive the object that created it**, and something has to own the release.

This lesson audits a small but faithful model of those resources: a panel that subscribes to \`resize\`, schedules a save, starts an interval and appends a DOM node. Half of it cleans up; half of it does not. The tests from the previous lesson tell us which half is which.`,
	task: `1. Press **Mount + unmount** and read the live counts: listeners, timers, intervals and DOM nodes all return to their previous values.
2. Press **Mount without cleanup** and compare — the numbers only go up.
3. Press **Run the audit**: a test mounts and unmounts a panel and asserts that nothing is left behind.
4. Press **Audit the leaky panel** to see the same test fail, and read which resource survived.
5. Now look at your own project: name one resource that has no owner. (In this editor there is at least one: the pending save timer, which is why \`onDestroy(flushSave)\` exists.)`,
	concept: `**Resource lifetime** — every resource attached to an object (listener, timer, interval, DOM node) must be released when that object dies, and the cleanest way is \`AbortController\`: one owner, one \`abort()\`.`,
	whyItMatters: `A leak is invisible: nothing throws, nothing logs, the app keeps working — and the memory graph keeps growing. Testing it is possible exactly because the previous lesson taught us to assert on cleanup, and fixing it is a design decision: decide who owns each resource, then make the release part of the object's contract.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 28</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — who releases the resources?</h3>
  <div id="toolbar">
    <button id="mount-btn">Mount + unmount</button>
    <button id="leak-btn">Mount without cleanup</button>
    <button id="audit-btn">Run the audit</button>
    <button id="audit-leak-btn">Audit the leaky panel</button>
  </div>
  <div id="stage"></div>
  <pre id="report">Mount a panel to start.</pre>
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
#toolbar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
#toolbar button {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#toolbar button:hover { border-color: #8b8bcc; }
#stage { display: flex; gap: 8px; min-height: 44px; }
.panel {
  background: #161628;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  color: #b0b0c8;
}
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
  min-height: 240px;
}`,
		javascript: `// Pixel Art Editor — Lesson 28: Memory I: Lifetime & Cleanup

const reportEl = document.getElementById("report");
const stage = document.getElementById("stage");

// ── Our instrument: count every resource the editor creates ──
const live = { listeners: 0, timers: 0, intervals: 0 };

function snapshot() {
  return {
    listeners: live.listeners,
    timers: live.timers,
    intervals: live.intervals,
    panels: stage.querySelectorAll(".panel").length
  };
}

function describe(state) {
  return (
    "listeners: " + state.listeners +
    " · timers: " + state.timers +
    " · intervals: " + state.intervals +
    " · panels: " + state.panels
  );
}

// ── A panel with the same resources as the real editor ──
function mountPanel({ cleanup = true } = {}) {
  const controller = new AbortController();

  // 1. a listener, like Preview.svelte listening for messages
  const onResize = () => {};
  window.addEventListener("resize", onResize, { signal: controller.signal });
  live.listeners++;

  // 2. a debounced timer, like the one that saves the editor contents
  const saveTimer = setTimeout(() => {}, 5000);
  live.timers++;

  // 3. a repeating interval, like the FPS meter
  const fpsInterval = setInterval(() => {}, 5000);
  live.intervals++;

  // 4. a DOM node, like the CodeMirror view
  const element = document.createElement("div");
  element.className = "panel";
  element.textContent = cleanup ? "panel with cleanup" : "panel without cleanup";
  stage.appendChild(element);

  return {
    element,
    destroy() {
      if (!cleanup) return; // ← the leak: the panel is gone, its resources are not

      controller.abort();      // releases the listener
      clearTimeout(saveTimer); // releases the timer
      clearInterval(fpsInterval); // releases the interval
      element.remove();        // releases the DOM node

      live.listeners--;
      live.timers--;
      live.intervals--;
    }
  };
}

// ── The test harness from Lesson 26 ──
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
    toEqual(expected) {
      const got = JSON.stringify(actual);
      const want = JSON.stringify(expected);
      if (got !== want) throw new Error("expected " + want + ", received " + got);
    }
  };
}

function audit({ cleanup }) {
  passed = 0;
  failed = 0;
  lines = [];

  const before = snapshot();

  test("a panel leaves no resources behind after destroy()", () => {
    const panel = mountPanel({ cleanup });
    panel.destroy();

    if (!cleanup) {
      // Simulate what a real unmount does: the object goes away.
      panel.element.remove();
    }

    expect(snapshot()).toEqual(before);
  });

  reportEl.textContent =
    "before mount : " + describe(before) + "\\n" +
    "after destroy: " + describe(snapshot()) + "\\n\\n" +
    lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";

  console.log("audit (cleanup: " + cleanup + "):", passed, "passed,", failed, "failed");
}

document.getElementById("mount-btn").addEventListener("click", () => {
  const panel = mountPanel();
  reportEl.textContent = "mounted → " + describe(snapshot()) + "\\npress again after unmounting";
  panel.destroy();
  reportEl.textContent += "\\nunmounted → " + describe(snapshot());
});

document.getElementById("leak-btn").addEventListener("click", () => {
  const panel = mountPanel({ cleanup: false });
  panel.element.remove(); // the object disappears, the resources stay
  reportEl.textContent =
    "the panel is gone from the page, but look at the counters:\\n" + describe(snapshot()) +
    "\\n\\nnothing threw and nothing logged. That is what a leak looks like.";
});

document.getElementById("audit-btn").addEventListener("click", () => audit({ cleanup: true }));
document.getElementById("audit-leak-btn").addEventListener("click", () => audit({ cleanup: false }));

reportEl.textContent = "starting state → " + describe(snapshot());
console.log("Resource audit ready");`
	}
};
