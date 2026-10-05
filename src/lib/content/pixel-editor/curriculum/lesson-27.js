// Pixel Art Editor — Lesson 27: Testing the Hard Parts
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 27,
	title: 'Testing the Hard Parts',
	description: `With the harness from the previous lesson, testing pure logic is easy: give an input, claim an output.

Then real code shows up, and it has three properties that make tests hard:

\`\`\`
time        the result depends on when you ask
randomness  the result changes on every run
side effects resources outside the function: listeners, timers, the DOM
\`\`\`

You do not test those by waiting or by hoping. You **replace the source of the problem with something you control**:

- **time** → inject a clock: the code asks \`now()\` instead of reading the real clock, and the test advances it by hand.
- **randomness** → seed it: the same seed must produce the same sequence, forever.
- **side effects** → observe the effect and then check the cleanup: subscribe, unsubscribe, and assert the count is back to zero.

That last one is the bridge to the next lesson.`,
	task: `1. Press **Run tests**: three groups, each one testing something that used to be untestable.
2. Read \`createFakeClock\` — the test moves time forward, so a result that depends on time becomes deterministic.
3. Read \`createRandom\`: the same seed produces the same sequence. Change the seed and the sequence changes.
4. Read the emitter test: it does not only check that the listener is called, it checks that **the listener count returns to zero**.
5. Try to write a test for something in your own project that depends on time. What would you have to inject?`,
	concept: `**Testability is a design property** — when time, randomness and side effects are injected instead of read from the environment, a test can control them; when they are hard-coded, the only way to test is to wait and hope.`,
	whyItMatters: `These three techniques are what make the difference between testing the easy 20% and testing the part where bugs actually live. And the third one — asserting that resources are released — is exactly how we are going to verify memory behaviour in the next lesson.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 27</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — testing time, randomness and side effects</h3>
  <div id="toolbar">
    <button id="run-btn">Run tests</button>
  </div>
  <pre id="report">Press Run tests.</pre>
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
  font-size: 12.5px;
  line-height: 1.8;
  color: #b0b0c8;
  white-space: pre-wrap;
  width: 640px;
  max-width: 100%;
  min-height: 280px;
}`,
		javascript: `// Pixel Art Editor — Lesson 27: Testing the Hard Parts

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
    toEqual(expected) {
      const got = JSON.stringify(actual);
      const want = JSON.stringify(expected);
      if (got !== want) throw new Error("expected " + want + ", received " + got);
    }
  };
}

// ── 1. Time: inject the clock instead of reading the environment ──
function createFrameTimer(now, window = 3) {
  const samples = [];
  let last = now();

  return {
    sample() {
      const current = now();
      samples.push(current - last);
      last = current;
      if (samples.length > window) samples.shift();
      return samples.length;
    },
    average() {
      if (samples.length === 0) return 0;
      return samples.reduce((sum, value) => sum + value, 0) / samples.length;
    }
  };
}

function createFakeClock(start = 0) {
  let current = start;
  return {
    now: () => current,
    advance(ms) { current += ms; }
  };
}

// ── 2. Randomness: seed it so it stops being random ──
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// ── 3. Side effects: observe them, then check the cleanup ──
function createEmitter() {
  const listeners = new Set();
  return {
    on(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    emit(value) {
      for (const handler of listeners) handler(value);
    },
    get size() { return listeners.size; }
  };
}

function runTests() {
  passed = 0;
  failed = 0;
  lines = [];

  // Time
  test("the frame timer reports the average of the samples it was given", () => {
    const clock = createFakeClock();
    const timer = createFrameTimer(clock.now);

    clock.advance(16);
    timer.sample();
    clock.advance(34);
    timer.sample();

    expect(timer.average()).toBe(25);
  });

  test("the frame timer keeps only the last N samples", () => {
    const clock = createFakeClock();
    const timer = createFrameTimer(clock.now, 2);

    for (const delta of [10, 20, 30]) {
      clock.advance(delta);
      timer.sample();
    }

    expect(timer.average()).toBe(25);
  });

  // Randomness
  test("the same seed always produces the same sequence", () => {
    const first = createRandom(42);
    const second = createRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  test("different seeds produce different sequences", () => {
    expect(createRandom(1)() === createRandom(2)()).toBe(false);
  });

  // Side effects
  test("an emitter calls every subscriber", () => {
    const emitter = createEmitter();
    const seen = [];
    emitter.on((value) => seen.push(value));
    emitter.on((value) => seen.push(value * 2));
    emitter.emit(5);
    expect(seen).toEqual([5, 10]);
  });

  test("unsubscribing leaves nothing behind", () => {
    const emitter = createEmitter();
    const off = emitter.on(() => {});
    expect(emitter.size).toBe(1);
    off();
    expect(emitter.size).toBe(0);
  });

  reportEl.textContent = lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";
  console.log("tests:", passed, "passed,", failed, "failed");
}

document.getElementById("run-btn").addEventListener("click", runTests);
runTests();`
	}
};
