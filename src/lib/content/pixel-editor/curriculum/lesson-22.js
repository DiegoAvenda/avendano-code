// Pixel Art Editor — Lesson 14: Find the Recursion Limit
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 22,
	title: 'Find the Recursion Limit',
	description: `The recursive fill is correct. So the next step is to make it bigger and see what happens.

Every call to \`floodFill\` occupies a **stack frame**: the arguments, the return address, the place to come back to. Those frames live in the call stack, and the call stack is not infinite — the browser gives each one a fixed budget.

So we are going to grow the region on purpose:

\`\`\`
16 × 16   →   1,024 cells
64 × 64   →   4,096 cells
256 × 256 → 65,536 cells
\`\`\`

At some size the fill stops with \`RangeError: Maximum call stack size exceeded\`. An **algorithm** is a recipe of steps to solve a problem: how to fill a shape, how to find the nearest box, how to avoid visiting the same place twice. This one is still correct — that is not a bug in the algorithm. It is a property of the machine that runs it.`,
	task: `1. Press 16 × 16, then 32 × 32 and read the **max depth** in the report — it tracks how deep the recursion went.
2. Keep going: 64 × 64, 128 × 128, 256 × 256.
3. Find the size where the fill reports a \`RangeError\` instead of a result.
4. Notice that the algorithm is still correct at every size — only the budget changed.
5. Before looking at the next lesson, write down your guess: what would you need so that the amount of pending work no longer lives in the call stack?`,
	concept: `**The call stack is a budget.** Recursion stores pending work in stack frames; when the recursion is deeper than the budget, execution stops with a \`RangeError\`.`,
	whyItMatters: `This is the moment where "a correct solution" and "a solution that works in production" separate. The problem is not the traversal order or the formula — it is *where the pending work is stored*. That question is the bridge to the next lesson.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 22</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Editor — how deep can recursion go?</h3>
  <div id="controls">
    <button class="size-btn" data-size="16">16 × 16</button>
    <button class="size-btn" data-size="32">32 × 32</button>
    <button class="size-btn" data-size="64">64 × 64</button>
    <button class="size-btn" data-size="128">128 × 128</button>
    <button class="size-btn" data-size="256">256 × 256</button>
  </div>
  <canvas id="canvas" width="64" height="64"></canvas>
  <p id="report">Pick a size to run a recursive fill from the top-left corner.</p>
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
#controls { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.size-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.size-btn:hover { border-color: #8b8bcc; }
#canvas {
  width: 320px;
  height: 320px;
  image-rendering: pixelated;
  border: 2px solid #3a3a5c;
}
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
  min-height: 54px;
  max-width: 620px;
}`,
		javascript: `// Pixel Art Editor — Lesson 22: Find the Recursion Limit

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reportEl = document.getElementById("report");

// A recursive fill, exactly like the bucket from the previous lesson.
function fillRecursive(buffer, width, height, x, y, target, replacement, state) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const index = y * width + x;
  if (buffer[index] !== target || target === replacement) return;

  buffer[index] = replacement;
  state.depth++;
  if (state.depth > state.maxDepth) state.maxDepth = state.depth;

  fillRecursive(buffer, width, height, x + 1, y, target, replacement, state);
  fillRecursive(buffer, width, height, x - 1, y, target, replacement, state);
  fillRecursive(buffer, width, height, x, y + 1, target, replacement, state);
  fillRecursive(buffer, width, height, x, y - 1, target, replacement, state);

  state.depth--;
}

function renderBuffer(buffer, size) {
  canvas.width = size;
  canvas.height = size;

  const image = ctx.createImageData(size, size);
  for (let i = 0; i < buffer.length; i++) {
    const color = buffer[i] === 0 ? [26, 26, 46] : [233, 69, 96];
    const o = i * 4;
    image.data[o] = color[0];
    image.data[o + 1] = color[1];
    image.data[o + 2] = color[2];
    image.data[o + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

function run(size) {
  const buffer = new Uint8Array(size * size);
  const state = { depth: 0, maxDepth: 0 };
  const start = performance.now();
  let outcome = "completed";
  let filled = 0;

  try {
    fillRecursive(buffer, size, size, 0, 0, 0, 1, state);
  } catch (error) {
    outcome = error.constructor.name + ": " + error.message;
  }

  const ms = performance.now() - start;
  for (let i = 0; i < buffer.length; i++) if (buffer[i] === 1) filled++;

  renderBuffer(buffer, size);

  reportEl.textContent =
    size + "×" + size + " (" + (size * size).toLocaleString() + " cells)\\n" +
    "filled: " + filled.toLocaleString() + " · max depth: " + state.maxDepth.toLocaleString() + "\\n" +
    outcome + " · " + ms.toFixed(1) + " ms";

  console.log(size + "x" + size, "->", outcome, "| max depth", state.maxDepth);
}

document.querySelectorAll(".size-btn").forEach((btn) => {
  btn.addEventListener("click", () => run(Number(btn.dataset.size)));
});

run(16);`
	}
};
