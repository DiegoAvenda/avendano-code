// Pixel Art Editor — Lesson 18: Split the Code
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 18,
	title: 'Split the Code',
	description: `The editor is no longer a small file. Buffer, rendering, history, tools and input all live in the same place, and every change means scrolling through code that belongs to something else.

The fix is not a new library. It is a decision about **responsibilities**:

\`\`\`
main.js      wires everything together
renderer.js  turns pixel data into an image
buffer.js    owns the pixels and index math
history.js   remembers the last N actions
paint.js     turns pointer events into changes on the buffer
\`\`\`

Each file exposes a small surface (\`export\`) and consumes what it needs (\`import\`). The set of imports is the **dependency graph** of the application.

Notice the direction of the arrows: \`paint.js\` knows about the buffer and the renderer; the renderer knows nothing about painting. That direction is what keeps the pieces replaceable.`,
	task: `1. Read the five module factories in the script — each one is one responsibility.
2. Find the \`graph\` object: that is the dependency graph the modules form.
3. Draw on the canvas: \`main\` passes input to \`paint\`, \`paint\` writes to \`buffer\`, \`buffer\` is rendered by \`renderer\`.
4. Press **Undo** — only \`history.js\` knows how undo works.
5. Change \`renderer.js\` so it draws with a different color mapping. Nothing else has to change.`,
	concept: `**ES modules and the dependency graph** — \`export\` declares what a module offers, \`import\` declares what it needs. The graph of those edges is the architecture of the app.`,
	whyItMatters: `Splitting by responsibility is what makes a project survive growth: you can reason about one piece at a time, replace it, and see at a glance what depends on what. And once the code is split into modules, a new question appears — how does the browser actually load all of these? That is the next lesson.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 18</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Editor — five modules, one application</h3>
  <div id="toolbar">
    <button id="btn-undo">↩ Undo</button>
    <span id="status">Strokes: 0</span>
  </div>
  <canvas id="canvas" width="32" height="32"></canvas>
  <pre id="graph"></pre>
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
#toolbar { display: flex; align-items: center; gap: 12px; }
#btn-undo {
  background: #2a2a44;
  color: #c0c0d8;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#status { color: #8888aa; font-size: 12px; }
#canvas {
  width: 320px;
  height: 320px;
  image-rendering: pixelated;
  border: 2px solid #3a3a5c;
  cursor: crosshair;
}
#graph {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: #b0b0c8;
  white-space: pre;
}`,
		javascript: `// Pixel Art Editor — Lesson 18: Split the Code

// ── buffer.js ─────────────────────────────────────────────
// Owns the pixels. Nothing here knows how they are drawn.
function createBuffer(width, height) {
  const pixels = new Uint8Array(width * height);
  return {
    width,
    height,
    pixels,
    index: (x, y) => y * width + x,
    get(x, y) { return pixels[y * width + x]; },
    set(x, y, value) { pixels[y * width + x] = value; }
  };
}

// ── renderer.js ───────────────────────────────────────────
// Turns buffer data into an image. It never writes to the buffer.
function createRenderer(canvas, palette) {
  const ctx = canvas.getContext("2d");
  let image = null;

  return {
    render(buffer) {
      if (!image || image.width !== buffer.width) {
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        image = ctx.createImageData(buffer.width, buffer.height);
      }
      const data = image.data;
      for (let i = 0; i < buffer.pixels.length; i++) {
        const hex = palette[buffer.pixels[i]] || palette[0];
        const o = i * 4;
        data[o] = parseInt(hex.slice(1, 3), 16);
        data[o + 1] = parseInt(hex.slice(3, 5), 16);
        data[o + 2] = parseInt(hex.slice(5, 7), 16);
        data[o + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    }
  };
}

// ── history.js ────────────────────────────────────────────
// Remembers the last N snapshots. It does not know what a pixel is.
function createHistory(capacity) {
  const entries = [];
  return {
    push(snapshot) {
      entries.push(snapshot);
      if (entries.length > capacity) entries.shift();
    },
    pop() { return entries.pop(); },
    get size() { return entries.length; }
  };
}

// ── paint.js ──────────────────────────────────────────────
// Translates pointer events into buffer changes.
function createPaint({ canvas, buffer, renderer, history, color, onchange }) {
  let drawing = false;

  function toGrid(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((event.clientX - rect.left) / rect.width) * buffer.width),
      y: Math.floor(((event.clientY - rect.top) / rect.height) * buffer.height)
    };
  }

  function paint(event) {
    const { x, y } = toGrid(event);
    if (x < 0 || x >= buffer.width || y < 0 || y >= buffer.height) return;
    if (buffer.get(x, y) === color) return;
    buffer.set(x, y, color);
    renderer.render(buffer);
  }

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    history.push(buffer.pixels.slice());
    canvas.setPointerCapture(event.pointerId);
    paint(event);
    onchange();
  });
  canvas.addEventListener("pointermove", (event) => { if (drawing) paint(event); });
  canvas.addEventListener("pointerup", () => { drawing = false; });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}

// ── main.js ───────────────────────────────────────────────
const PALETTE = ["#1a1a2e", "#e94560", "#48dbfb", "#ffd166"];

const canvas = document.getElementById("canvas");
const statusEl = document.getElementById("status");

const buffer = createBuffer(32, 32);
const renderer = createRenderer(canvas, PALETTE);
const history = createHistory(50);

// The dependency graph these modules form:
const graph = {
  "main.js": ["buffer.js", "renderer.js", "history.js", "paint.js"],
  "paint.js": ["buffer.js", "renderer.js", "history.js"],
  "renderer.js": [],
  "buffer.js": [],
  "history.js": []
};

function updateStatus() {
  statusEl.textContent = "Strokes: " + history.size;
}

createPaint({
  canvas,
  buffer,
  renderer,
  history,
  color: 1,
  onchange: updateStatus
});

document.getElementById("btn-undo").addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  buffer.pixels.set(previous);
  renderer.render(buffer);
  updateStatus();
});

renderer.render(buffer);
updateStatus();

document.getElementById("graph").textContent =
  "dependency graph\\n" + JSON.stringify(graph, null, 2);
console.log("Modules wired:", Object.keys(graph).join(", "));`
	}
};
