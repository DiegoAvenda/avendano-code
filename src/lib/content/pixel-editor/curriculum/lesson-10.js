// Lesson 10 — Escape the DOM
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 10,
	title: 'Escape the DOM',
	description: `We measured the DOM grid and we know its cost. Now we introduce a second way to render the same thing: **Canvas**.

With Canvas the browser gives us a bitmap and a drawing API. Nothing in the page represents a pixel any more — we ask for rectangles and the browser paints them:

\`\`\`
Pixel Data  →  Canvas  →  Visual Output
\`\`\`

The interesting part is not the new API. It is the comparison: same grid, two representations, two measurements.`,
	task: `1. Press a size button and watch the Canvas version draw the checkerboard.
2. Press **Compare DOM vs Canvas** — it builds the same grid both ways and times each one.
3. Compare the numbers and, more importantly, the element counts.
4. Open DevTools → Performance and record the comparison. Which panels are still busy for the DOM version?
5. Change \`LIGHT\` and \`DARK\` to your own colors and run again.`,
	concept: `**Rendering is a choice.** The DOM describes structure and lets the browser render it; Canvas describes pixels directly. The same data can be shown by either one.`,
	whyItMatters: `The DOM version is not "wrong" — it is the right representation for a page of text or a list. But our data is a grid of pixels, and that access pattern is what Canvas was built for. Choosing a representation is an engineering decision, and now you can measure it.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 10</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — the same grid, two representations</h3>
  <div id="controls">
    <button class="size-btn" data-size="32">32 × 32</button>
    <button class="size-btn" data-size="64">64 × 64</button>
    <button id="compare-btn">Compare DOM vs Canvas</button>
  </div>
  <p id="report">Canvas draws the whole grid with a single element.</p>
  <canvas id="canvas" width="32" height="32"></canvas>
  <div id="dom-grid"></div>
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
.size-btn, #compare-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.size-btn:hover, #compare-btn:hover { border-color: #8b8bcc; }
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  min-height: 36px;
  max-width: 620px;
}
#canvas {
  width: 512px;
  height: 512px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #3a3a5c;
}
#dom-grid {
  display: grid;
  grid-template-columns: repeat(var(--size, 32), 1fr);
  width: 512px;
  height: 512px;
}
.cell.light { background: #2a2a3e; }
.cell.dark { background: #1a1a2e; }`,
		javascript: `// Pixel Art Editor — Lesson 10: Escape the DOM

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const domGrid = document.getElementById("dom-grid");
const reportEl = document.getElementById("report");

const LIGHT = "#2a2a3e";
const DARK = "#1a1a2e";
let size = 32;

// ── Canvas: one element, pixel by pixel ──
function renderCanvas(size) {
  const start = performance.now();

  canvas.width = size;
  canvas.height = size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? LIGHT : DARK;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return performance.now() - start;
}

// ── DOM: one element per pixel ──
function renderDom(size) {
  const start = performance.now();

  domGrid.innerHTML = "";
  domGrid.style.setProperty("--size", size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.className = (x + y) % 2 === 0 ? "cell light" : "cell dark";
      domGrid.appendChild(cell);
    }
  }

  return performance.now() - start;
}

function setSize(next) {
  size = next;
  const ms = renderCanvas(size);
  domGrid.innerHTML = "";
  reportEl.textContent =
    size + "×" + size + " on Canvas: " + (size * size).toLocaleString() +
    " pixels in " + ms.toFixed(1) + " ms · 1 element";
  console.log("Canvas", size + "x" + size, ms.toFixed(1) + "ms");
}

document.querySelectorAll(".size-btn").forEach((btn) => {
  btn.addEventListener("click", () => setSize(Number(btn.dataset.size)));
});

document.getElementById("compare-btn").addEventListener("click", () => {
  const canvasMs = renderCanvas(size);
  const domMs = renderDom(size);
  const cells = size * size;

  reportEl.textContent =
    size + "×" + size + " — Canvas: " + canvasMs.toFixed(1) + " ms (1 element)" +
    " vs DOM: " + domMs.toFixed(1) + " ms (" + cells.toLocaleString() + " elements)";

  console.log("Compare", size + "x" + size, "canvas", canvasMs.toFixed(1), "dom", domMs.toFixed(1));
});

setSize(32);`
	}
};
