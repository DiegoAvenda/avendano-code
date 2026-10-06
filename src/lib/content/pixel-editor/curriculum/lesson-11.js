// Pixel Art Editor — Lesson 11: Where Does a Pixel Live?
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 11,
	title: 'Where Does a Pixel Live?',
	description: `Canvas can draw fast, but it does not remember anything: if we do not store the picture ourselves, we lose it on the next frame.

The first idea that comes to mind is a grid of rows and columns:

\`\`\`
const pixels = [
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0]
];
pixels[y][x] = 1;
\`\`\`

It is readable, but it is thousands of small arrays, each one living somewhere else in memory. The question for this lesson is: **do we really need arrays inside arrays?**

If the grid is always \`WIDTH\` wide, one single array can hold every pixel and we can compute where a pixel lives:

\`\`\`
index = y * WIDTH + x
\`\`\`

That formula is called **row-major indexing**.`,
	task: `1. Compare the two buffers: \`nested\` (array of arrays) and \`flat\` (one array).
2. Follow \`indexOf(x, y)\` — it is the row-major formula \`y * WIDTH + x\`.
3. Press **Draw pattern** and check that both representations end up with the same values.
4. Press **Benchmark** to time writes and reads on each representation.
5. Change \`WIDTH\` and \`HEIGHT\` and run the benchmark again. Does the difference grow with size?`,
	concept: `**Row-major (flat) indexing** — a two-dimensional grid stored in a single one-dimensional array, with \`index = y * width + x\`.`,
	whyItMatters: `Everything we build next — rendering, drawing, flood fill, undo — reads and writes this buffer millions of times. A single contiguous array is simpler to copy, simpler to compare and friendlier to the CPU cache than thousands of separate arrays.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 11</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — two ways to store the same grid</h3>
  <div id="controls">
    <button id="draw-btn">Draw pattern</button>
    <button id="bench-btn">Benchmark</button>
  </div>
  <canvas id="canvas" width="64" height="64"></canvas>
  <p id="report">Both buffers should hold the same picture.</p>
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
.btn, button {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.btn:hover, button:hover { border-color: #8b8bcc; }
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  border: 2px solid #3a3a5c;
}
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
  min-height: 40px;
}`,
		javascript: `// Pixel Art Editor — Lesson 11: Where Does a Pixel Live?

const WIDTH = 64;
const HEIGHT = 64;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reportEl = document.getElementById("report");

// ── Representation A: one array per row ──
const nested = Array.from({ length: HEIGHT }, () => new Array(WIDTH).fill(0));

// ── Representation B: a single flat array ──
const flat = new Array(WIDTH * HEIGHT).fill(0);

// Row-major indexing: where does (x, y) live inside one dimension?
function indexOf(x, y) {
  return y * WIDTH + x;
}

const COLORS = ["#1a1a2e", "#e94560"];

function drawPattern() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const value = (x * 3 + y * 5) % 7 === 0 ? 1 : 0;
      nested[y][x] = value;
      flat[indexOf(x, y)] = value;
    }
  }
  render();
}

function render() {
  const image = ctx.createImageData(WIDTH, HEIGHT);
  const data = image.data;

  for (let i = 0; i < flat.length; i++) {
    const color = COLORS[flat[i]] || COLORS[0];
    const o = i * 4;
    data[o] = parseInt(color.slice(1, 3), 16);
    data[o + 1] = parseInt(color.slice(3, 5), 16);
    data[o + 2] = parseInt(color.slice(5, 7), 16);
    data[o + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
}

function sameValues() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (nested[y][x] !== flat[indexOf(x, y)]) return false;
    }
  }
  return true;
}

document.getElementById("draw-btn").addEventListener("click", () => {
  drawPattern();
  reportEl.textContent = "Pattern drawn.\\nBoth representations match: " + sameValues();
  console.log("Both representations match:", sameValues());
});

document.getElementById("bench-btn").addEventListener("click", () => {
  const ITERS = 200;

  let start = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) nested[y][x] = (nested[y][x] + 1) % 2;
    }
  }
  const nestedMs = performance.now() - start;

  start = performance.now();
  for (let i = 0; i < ITERS; i++) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const idx = indexOf(x, y);
        flat[idx] = (flat[idx] + 1) % 2;
      }
    }
  }
  const flatMs = performance.now() - start;

  reportEl.textContent =
    "Writes × " + ITERS + " on " + (WIDTH * HEIGHT).toLocaleString() + " pixels\\n" +
    "Array of arrays : " + nestedMs.toFixed(1) + " ms\\n" +
    "Flat array      : " + flatMs.toFixed(1) + " ms";

  console.log("nested", nestedMs.toFixed(1), "ms · flat", flatMs.toFixed(1), "ms");
  render();
});

drawPattern();`
	}
};
