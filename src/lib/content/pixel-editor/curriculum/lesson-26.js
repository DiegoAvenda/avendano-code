// Pixel Art Editor — Lesson 18: Project Close: Interview Room
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 26,
	title: 'Project Close: Interview Room',
	description: `The project is finished, so the last thing this module owes you is the ability to **talk about it**. This is the shape a technical interview actually takes: three questions about the work you just did, without notes.

\`\`\`
1. DOM vs Canvas       why the first version froze, and what the second cost
2. Memory and search   Uint8Array, and a queue instead of recursion
3. Bounded history     the ring buffer, and how you prove the work is done
\`\`\`

The questions are not trivia. Each one is really asking about a decision you made and a number you measured, and you have both. Answer out loud — or in the box — before you press **Compare with a model answer**: the gap between what you said and what a strong answer includes is the useful part.`,
	task: `1. Read question 1 and answer it out loud, as if the interviewer were in the room. Then write the summary in the box — no scrolling back to the lesson.
2. Press **Compare with a model answer** and note what you missed: the cause, the trade-off, or the number.
3. Repeat with questions 2 and 3.
4. Close with the evidence: press **Run the closing checklist**, then **Break it** and watch the first item go red. Being able to show that is the last answer.`,
	concept: `**Trade-offs, not definitions.** No interviewer is checking whether you can recite what a queue is; they are checking whether you can say what it bought you, what it cost, and how you knew. Every answer in this module has the same shape: the simple version, the measurement that broke it, the structure you chose, the number that improved.`,
	whyItMatters: `This is the same conversation you will have in a hiring loop, where a question that sounds like trivia is really a question about a decision you made. You have the decisions, the numbers and the vocabulary — this lesson is the rehearsal. The closing checklist below is the evidence you take into it. This concludes Module 1.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 26</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — interview room</h3>
  <p id="intro">Three questions about the project you just built. Answer each one before you reveal anything.</p>

  <section class="question">
    <h4>1. The first version of the editor froze at 16,384 cells while this one runs at 65,536. What broke, and what did the Canvas version cost you?</h4>
    <textarea id="answer-1" rows="3" placeholder="Why it froze, what replaced it, what you traded away..."></textarea>
    <button id="reveal-1">Compare with a model answer</button>
    <div class="model" id="model-1" hidden>
      <p><strong>Cause:</strong> 16,384 cells are 16,384 boxes in the page, so a single change makes the browser recalculate layout and repaint all of them — the timeline shows frames collapsing, not one slow line. <strong>Fix:</strong> one canvas you paint into, so the cost is proportional to the pixels that changed rather than to the elements on the page. <strong>Cost:</strong> pixels stop being nodes: no per-cell events, no CSS, and you convert a click into an index yourself with <code>y * width + x</code>.</p>
    </div>
  </section>

  <section class="question">
    <h4>2. The buffer is a Uint8Array and the fill walks it with a queue. Why those two, and what would recursion have cost?</h4>
    <textarea id="answer-2" rows="3" placeholder="What the typed array buys, why a queue, what recursion costs..."></textarea>
    <button id="reveal-2">Compare with a model answer</button>
    <div class="model" id="model-2" hidden>
      <p><strong>Typed memory:</strong> one byte per pixel in a single contiguous block — a 256×256 buffer is exactly 65,536 bytes, with no per-pixel allocation and no object overhead, so its size is arithmetic instead of a guess and a snapshot is a cheap copy. <strong>Queue:</strong> the traversal is iterative and each pixel is queued once, which is why region size stops mattering to the stack. <strong>Recursion:</strong> the same fill overflows the call stack — you measured that limit before replacing it.</p>
    </div>
  </section>

  <section class="question">
    <h4>3. Undo is a ring buffer. What does bounding the history change, and how do you show the project is finished?</h4>
    <textarea id="answer-3" rows="3" placeholder="What bounding changes, how you pick the size, how you prove it is done..."></textarea>
    <button id="reveal-3">Compare with a model answer</button>
    <div class="model" id="model-3" hidden>
      <p><strong>Bounding it:</strong> a fixed array plus a write pointer that wraps, so memory stops growing with the session; the price is that the oldest states disappear and "undo" now means "the last N actions". <strong>Choosing N:</strong> bytes per snapshot (width × height) times N — 100 snapshots of a 256×256 buffer is 6.5 MB, which is a number you can defend. <strong>Proving it:</strong> the closing checklist — clean console, pure logic asserted by hand, resources released. With no tooling the evidence is manual, and that is still evidence.</p>
    </div>
  </section>

  <div id="toolbar">
    <button id="run-btn">Run the closing checklist</button>
    <button id="break-btn">Break it</button>
  </div>
  <pre id="report">Run the closing checklist to see the three items.</pre>
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
#intro {
  max-width: 640px;
  font-size: 13px;
  line-height: 1.7;
  color: #b0b0c8;
  text-align: center;
}
.question {
  width: 640px;
  max-width: 100%;
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.question h4 { font-size: 13.5px; line-height: 1.6; }
textarea {
  background: #0d0d1a;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
}
textarea:focus { outline: 1px solid #48dbfb; }
.model {
  border-left: 2px solid #48dbfb;
  padding-left: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #b0b0c8;
}
.model p { margin: 0; }
#toolbar { display: flex; gap: 8px; }
#run-btn, #break-btn, #reveal-1, #reveal-2, #reveal-3 {
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
#reveal-1:hover, #reveal-2:hover, #reveal-3:hover { border-color: #48dbfb; }
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
		javascript: `// Pixel Art Editor — Lesson 26: Project Close: Interview Room

// ── Part 1: the three interview questions ──
// Each button toggles the model answer for its question, so you compare it
// against your own instead of reading it first.
[1, 2, 3].forEach((n) => {
  const button = document.getElementById("reveal-" + n);
  const model = document.getElementById("model-" + n);

  button.addEventListener("click", () => {
    model.hidden = !model.hidden;
    button.textContent = model.hidden ? "Compare with a model answer" : "Hide the model answer";
  });
});

// ── Part 2: the closing checklist (the evidence behind question 3) ──
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
