// Pixel Art Editor — Lesson 9: The DOM Limit
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 9,
	title: 'The DOM Limit',
	description: `The editor works. The next question is not "can we draw a grid?" but **"what happens when the grid gets big?"**

Every cell is a real DOM element, and the browser has to style it, lay it out and paint it:

\`\`\`
16 × 16   =    256 cells
128 × 128 = 16,384 cells   ← the challenge
256 × 256 = 65,536 cells
\`\`\`

At 16,384 elements the page stops responding while it builds, and **layout** becomes the expensive part of every interaction. We are not going to claim that the browser "breaks": we are going to measure it, watch the flame chart and read the numbers.`,
	task: `1. Press 16 × 16, then 64 × 64 and watch the build time grow with the square of the size.
2. Press **128 × 128** — that is 16,384 elements. Try to scroll or type while it builds.
3. Open DevTools → **Elements** and find those 16,384 nodes. Then → **Layout** and see how long a layout takes.
4. Open DevTools → Performance and record while you build the grid: **scripting**, **style calculation**, **layout**, **paint**.
5. Write down which of those costs would disappear if the pixels were not elements at all.`,
	concept: `**The DOM is a rendering representation, not a data structure.** A data structure is a way of organising information so the right answer arrives fast — and the same data can be fast or unusably slow depending on how you store it. Each cell here is an element with styles, layout and paint work attached to it, so the cost grows with the number of cells — not with the size of the drawing.`,
	whyItMatters: `Before choosing a technique we should measure. The conclusion is not "my loop is wrong"; it is "my representation generates too much work for the browser". That is the question the next lesson answers.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 9</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — how far can the DOM go?</h3>
  <div id="controls">
    <button class="size-btn" data-size="16">16 × 16</button>
    <button class="size-btn" data-size="32">32 × 32</button>
    <button class="size-btn" data-size="64">64 × 64</button>
    <button class="size-btn" data-size="128">128 × 128 (16,384)</button>
    <button class="size-btn" data-size="256">256 × 256</button>
  </div>
  <p id="report">Pick a size to build the grid and measure it.</p>
  <div id="grid"></div>
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
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  min-height: 36px;
  max-width: 560px;
}
#grid {
  display: grid;
  grid-template-columns: repeat(var(--size, 16), 1fr);
  width: 512px;
  height: 512px;
  border: 2px solid #3a3a5c;
}
.cell { width: 100%; aspect-ratio: 1; }
.cell.light { background: #2a2a3e; }
.cell.dark { background: #1a1a2e; }`,
		javascript: `// Pixel Art Editor — Lesson 9: The DOM Limit

const gridEl = document.getElementById("grid");
const reportEl = document.getElementById("report");

function buildGrid(size) {
  const start = performance.now();

  gridEl.innerHTML = "";
  gridEl.style.setProperty("--size", size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.className = (x + y) % 2 === 0 ? "cell light" : "cell dark";
      cell.dataset.x = x;
      cell.dataset.y = y;
      gridEl.appendChild(cell);
    }
  }

  const elapsed = performance.now() - start;
  const cells = size * size;
  const nodes = document.getElementsByTagName("*").length;

  reportEl.textContent =
    size + "×" + size + " → " + cells.toLocaleString() + " cells built in " +
    elapsed.toFixed(1) + " ms · " + nodes.toLocaleString() + " DOM nodes in the page";

  console.log(size + "x" + size + ":", cells.toLocaleString(), "cells in", elapsed.toFixed(1), "ms");
}

document.querySelectorAll(".size-btn").forEach((btn) => {
  btn.addEventListener("click", () => buildGrid(Number(btn.dataset.size)));
});

buildGrid(16);`
	}
};
