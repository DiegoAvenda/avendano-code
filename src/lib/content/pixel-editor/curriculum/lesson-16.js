// Pixel Art Editor — Lesson 16: The Border Inspector
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 16,
	title: 'The Border Inspector',
	type: 'challenge',
	description: `**Integrative challenge (boss fight).** You already built the two halves of this: a flat pixel buffer (\`Uint8Array\`, row-major) and a queue that walks a region without recursion. Now use them for something that is **not** filling.

The editor needs a "selection outline": when the user clicks a shape, we want the **outer border** of that shape, not its interior. The border of a region is made of the pixels that have at least one 4-directional neighbour *outside* the region — either a different colour, or past the edge of the canvas:

\`\`\`
0 0 0 0 0
0 1 1 1 0     the eight 1s on the ring are the border
0 1 1 1 0     the centre 1 has four neighbours inside → interior
0 1 1 1 0
0 0 0 0 0
\`\`\`

**The 80/20:** 80% of the work is the structure you already have — the same BFS with a queue, the same \`index = y * width + x\` math. The 20% that is new is the boundary condition: pushing neighbours into the queue is not enough, you have to decide, for every pixel you visit, whether it touches the outside.

Implement this function in the editor:

\`\`\`ts
function getRegionBorder(
  buffer: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): number[]
\`\`\`

Return the **1D indices** of the border pixels. The colour of the region is whatever \`buffer[startY * width + startX]\` holds. The checks below run four cases, including one where the shape touches the canvas edge and one with a second shape that must be ignored.`,
	task: `1. Read \`getRegionBorder\` in the editor: the signature and the checks are provided, the body is yours.
2. Walk the region from the start pixel using the queue from the previous lesson.
3. For every pixel you visit, look at its four neighbours: if any of them is out of bounds or has a different colour, that pixel is part of the border.
4. Press **Run the checks** as many times as you need — each case tells you what it expected.
5. When all four cases pass, the closing card appears. Read it: the pattern you just wrote is the core of two classic interview problems.`,
	concept: `**BFS plus a boundary condition.** The traversal is the one you already know; the new reasoning is per-pixel: a pixel belongs to the border when at least one of its neighbours is outside the region — where "outside" includes the edge of the canvas.`,
	whyItMatters: `This is the shape of a whole family of problems: flood fill asks "which pixels are connected?", but perimeter problems ask "which connected pixels touch the outside?" The same traversal, a different question, and the neighbour check is where the reasoning lives.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 16</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — the selection outline</h3>
  <div id="toolbar">
    <button id="run-btn">Run the checks</button>
  </div>
  <canvas id="canvas" width="16" height="16"></canvas>
  <pre id="report">Implement getRegionBorder and press Run the checks.</pre>
  <section id="card" hidden>
    <h4>Challenge cleared</h4>
    <p><strong>Interview Connection:</strong> This pattern is the basis of <strong>LC 463 (Island Perimeter)</strong> and <strong>LC 733 (Flood Fill)</strong>. Try solving them with what you just learned!</p>
  </section>
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
#canvas {
  width: 256px;
  height: 256px;
  image-rendering: pixelated;
  border: 2px solid #3a3a5c;
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
  min-height: 220px;
}
#card {
  width: 640px;
  max-width: 100%;
  background: rgba(72, 219, 251, 0.08);
  border: 1px solid #48dbfb;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.7;
}
#card h4 {
  margin-bottom: 6px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #48dbfb;
}`,
		javascript: `// Pixel Art Editor — Lesson 16: The Border Inspector

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reportEl = document.getElementById("report");
const cardEl = document.getElementById("card");

const WIDTH = 16;
const HEIGHT = 16;
const COLORS = ["#1a1a2e", "#e94560", "#48dbfb"];

// ── Provided: a flat buffer with two shapes on it ──
const buffer = new Uint8Array(WIDTH * HEIGHT);
const indexOf = (x, y) => y * WIDTH + x;

function fillRect(x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) buffer[indexOf(x, y)] = color;
    }
  }
}

fillRect(2, 2, 8, 6, 1);   // the shape we will inspect
fillRect(11, 10, 3, 3, 2); // a second shape that must be ignored

function render(border = []) {
  const image = ctx.createImageData(WIDTH, HEIGHT);
  const isBorder = new Set(border);

  for (let i = 0; i < buffer.length; i++) {
    const hex = isBorder.has(i) ? "#ffd166" : COLORS[buffer[i]] || COLORS[0];
    const o = i * 4;
    image.data[o] = parseInt(hex.slice(1, 3), 16);
    image.data[o + 1] = parseInt(hex.slice(3, 5), 16);
    image.data[o + 2] = parseInt(hex.slice(5, 7), 16);
    image.data[o + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
}

// ─────────────────────────────────────────────────────────────
// YOUR CODE (the 20%): 80% of this is the BFS from Lesson 15.
// ─────────────────────────────────────────────────────────────
function getRegionBorder(buffer, width, height, startX, startY) {
  // Your code here
}

// ── Provided: four cases with known answers ──
function bufferFromRows(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const data = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data[y * width + x] = Number(rows[y][x]);
  }

  return { data, width, height };
}

const CASES = [
  {
    name: "a single pixel has no interior",
    rows: ["00000", "00000", "00100", "00000", "00000"],
    start: [2, 2],
    expected: [12]
  },
  {
    name: "a shape touching the canvas edge is all border",
    rows: ["11000", "11000", "11000", "00000", "00000"],
    start: [0, 0],
    expected: [0, 1, 5, 6, 10, 11]
  },
  {
    name: "interior pixels are not border",
    rows: ["00000", "01110", "01110", "01110", "00000"],
    start: [2, 2],
    expected: [6, 7, 8, 11, 13, 16, 17, 18]
  },
  {
    name: "only the region of the start point is inspected",
    rows: ["01100", "01100", "00000", "00022", "00022"],
    start: [1, 0],
    expected: [1, 2, 6, 7]
  }
];

function sameIndices(actual, expected) {
  if (!Array.isArray(actual)) return false;
  const a = [...new Set(actual)].sort((x, y) => x - y);
  const b = [...expected].sort((x, y) => x - y);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function runChecks() {
  const lines = [];

  for (const testCase of CASES) {
    const { data, width, height } = bufferFromRows(testCase.rows);
    let actual;
    let error = null;

    try {
      actual = getRegionBorder(data, width, height, testCase.start[0], testCase.start[1]);
    } catch (thrown) {
      error = thrown.message;
    }

    const ok = !error && sameIndices(actual, testCase.expected);
    lines.push(
      (ok ? "✓ " : "✗ ") + testCase.name +
        (ok
          ? " — " + testCase.expected.length + " border pixels"
          : "\\n    expected [" + testCase.expected.join(", ") + "]" +
            (error ? "\\n    error: " + error : "\\n    received " + JSON.stringify(actual)))
    );
  }

  const failed = lines.filter((line) => line.startsWith("✗")).length;
  const passed = CASES.length - failed;

  reportEl.textContent =
    lines.join("\\n") + "\\n\\n" + passed + " of " + CASES.length + " cases pass" +
    (failed === 0 ? " — challenge cleared" : "");

  // Visual feedback on the demo shape.
  let border = [];
  try {
    border = getRegionBorder(buffer, WIDTH, HEIGHT, 3, 3) || [];
  } catch {
    border = [];
  }
  render(Array.isArray(border) ? border : []);

  cardEl.hidden = failed !== 0;
  console.log("border challenge:", passed + "/" + CASES.length, "cases");
}

document.getElementById("run-btn").addEventListener("click", runChecks);

render([]);
runChecks();
console.log("Implement getRegionBorder and press Run the checks");`
	}
};
