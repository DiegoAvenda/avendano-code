// Pixel Art Editor — Lesson 27: Write Your Own Tests
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 27,
	title: 'Write Your Own Tests',
	description: `Everything we built so far —the index math, the flood fill, the ring buffer— we verified **by clicking and looking**. That works while you are the one clicking, and it stops working the moment you change one line.

A test is a claim about your code that a machine re-checks for you:

\`\`\`
test("a ring buffer keeps only the last N items", () => {
  const buffer = new RingBuffer(3);
  [1, 2, 3, 4].forEach((value) => buffer.push(value));
  expect(buffer.toArray()).toEqual([2, 3, 4]);
});
\`\`\`

We are not going to install anything. Just like the bundler in Lesson 19, we write the tool ourselves first, so we know exactly what it does:

\`\`\`
test(name, fn)   runs fn, catches the failure, records pass or fail
expect(value)    makes a claim about the value
\`\`\`

Eleven lines. Enough to test the code you already wrote.`,
	task: `1. Press **Run tests** and read the report — three of these tests cover the ring buffer from Lesson 16 and one covers the index math from Lesson 11.
2. Look at \`expect\`: it compares the value you got with the value you expected, and throws a message when they differ.
3. Press **Add a failing test** — a wrong expectation is included on purpose, so you can see what a failure looks like.
4. Fix that expectation (the ring buffer keeps the last N items, not the first ones) and run again.
5. Add a test of your own: what should \`pop()\` return when the buffer is empty?`,
	concept: `**A test is an executable claim** — a small function that sets up a situation, compares the real result with the expected one, and fails loudly when they disagree.`,
	whyItMatters: `We are about to change this editor again: cleaning up resources, measuring performance, adding types. Without tests, every one of those changes is a gamble. With tests, a change that breaks the index math or the undo history tells you immediately — and the claim stays in the repo for the next person.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 27</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — tests for the code you already wrote</h3>
  <div id="toolbar">
    <button id="run-btn">Run tests</button>
    <button id="fail-btn">Add a failing test</button>
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
#toolbar { display: flex; gap: 8px; }
#run-btn, #fail-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#run-btn:hover, #fail-btn:hover { border-color: #8b8bcc; }
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
  min-height: 260px;
}`,
		javascript: `// Pixel Art Editor — Lesson 27: Write Your Own Tests

const reportEl = document.getElementById("report");

// ── 1. The tool: eleven lines ──
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

function runTests() {
  passed = 0;
  failed = 0;
  lines = [];

  // ── The code under test: index math from Lesson 11 ──
  const indexOf = (x, y, width) => y * width + x;

  test("index math walks each row before the next", () => {
    expect(indexOf(0, 0, 4)).toBe(0);
    expect(indexOf(3, 0, 4)).toBe(3);
    expect(indexOf(0, 1, 4)).toBe(4);
  });

  // ── The code under test: the ring buffer from Lesson 16 ──
  class RingBuffer {
    constructor(capacity) {
      this.buffer = new Array(capacity);
      this.capacity = capacity;
      this.head = 0;
      this.count = 0;
    }
    push(item) {
      this.buffer[this.head] = item;
      this.head = (this.head + 1) % this.capacity;
      if (this.count < this.capacity) this.count++;
    }
    pop() {
      if (this.count === 0) return undefined;
      this.head = (this.head - 1 + this.capacity) % this.capacity;
      this.count--;
      const item = this.buffer[this.head];
      this.buffer[this.head] = undefined;
      return item;
    }
    forEach(fn) {
      if (this.count === 0) return;
      const start = (this.head - this.count + this.capacity) % this.capacity;
      for (let i = 0; i < this.count; i++) fn(this.buffer[(start + i) % this.capacity], i);
    }
    get size() { return this.count; }
  }

  test("a ring buffer keeps only the last N items", () => {
    const buffer = new RingBuffer(3);
    [1, 2, 3, 4].forEach((value) => buffer.push(value));
    const values = [];
    buffer.forEach((value) => values.push(value));
    expect(values).toEqual([2, 3, 4]);
  });

  test("size never grows past the capacity", () => {
    const buffer = new RingBuffer(2);
    for (let i = 0; i < 10; i++) buffer.push(i);
    expect(buffer.size).toBe(2);
  });

  test("pop returns the newest item first", () => {
    const buffer = new RingBuffer(3);
    buffer.push("a");
    buffer.push("b");
    expect(buffer.pop()).toBe("b");
    expect(buffer.pop()).toBe("a");
  });

  test("pop on an empty buffer returns undefined", () => {
    expect(new RingBuffer(2).pop()).toBe(undefined);
  });

  reportEl.textContent = lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";
  console.log("tests:", passed, "passed,", failed, "failed");
}

document.getElementById("run-btn").addEventListener("click", runTests);

// A wrong expectation, on purpose: see what a failure looks like.
document.getElementById("fail-btn").addEventListener("click", () => {
  runTests();
  test("the ring buffer keeps insertion order after wrapping", () => {
    const buffer = new RingBuffer(2);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    const values = [];
    buffer.forEach((value) => values.push(value));
    expect(values).toEqual([1, 2]);
  });
  reportEl.textContent = lines.join("\\n") + "\\n\\n" + passed + " passed, " + failed + " failed";
  console.log("with the failing test:", passed, "passed,", failed, "failed");
});

runTests();`
	}
};
