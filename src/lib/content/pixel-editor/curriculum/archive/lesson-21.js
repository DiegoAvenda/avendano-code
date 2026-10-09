// Pixel Art Editor — Lesson 21: Why Vite?
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 21,
	title: 'Why Vite?',
	description: `You have built the pieces yourself: modules, a dependency graph, and a bundler. Now a tool can appear — and it will make sense, because you know the problem it solves.

In development you want **fast feedback**: don't bundle everything on every change. Transform a module the first time it is requested and keep it in a cache, serve it as a native ES module, and when a file changes, send the browser **only the patch** for that module. That is a dev server with hot module replacement.

For production you want the opposite: **one optimised build**. Every module transformed once, bundled and minified, assets emitted with content hashes so they can be cached forever.

\`\`\`
dev      : request → transform → cache        (on demand)
build    : entry → graph → transform → bundle (once)
HMR      : change → patch the affected module
\`\`\`

That is what Vite gives you: an extremely fast development server and a production build pipeline — today built on Rolldown — on top of the module system you just learned to reason about.`,
	task: `1. Press **Dev: request main.js twice**. The first transform is paid once; the second request is a cache hit.
2. Press **Dev: edit paint.js** and watch HMR patch only the module that changed — no full reload.
3. Press **Build** and count how much work is done once, up front, for the whole graph.
4. Compare "work done" in development vs production.
5. In your own project, open \`package.json\`: map each script (\`dev\`, \`build\`, \`preview\`) to one of the pipelines above.`,
	concept: `**Dev server vs build** — the dev server transforms modules on demand and patches changes in place; the build transforms the whole graph once and emits optimised static assets.`,
	whyItMatters: `This is the last piece of the tooling bridge: you now know what \`npm run dev\` and \`npm run build\` actually do, why HMR feels instant, and why production assets look so different from your source files.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 21</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Why Vite? — dev server, HMR and build</h3>
  <div id="controls">
    <button id="dev-btn">Dev: request main.js twice</button>
    <button id="hmr-btn">Dev: edit paint.js</button>
    <button id="build-btn">Build</button>
  </div>
  <pre id="report">Pick a pipeline to run.</pre>
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
#dev-btn, #hmr-btn, #build-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#dev-btn:hover, #hmr-btn:hover, #build-btn:hover { border-color: #8b8bcc; }
#report {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #b0b0c8;
  white-space: pre;
  min-width: 520px;
  min-height: 220px;
}`,
		javascript: `// Pixel Art Editor — Lesson 21: Why Vite?

const reportEl = document.getElementById("report");

const MODULES = ["main.js", "paint.js", "buffer.js", "render.js", "history.js"];
const TRANSFORM_MS = 30;

// ── Dev server: transform on demand, then cache ──
const transformCache = new Map();
let transforms = 0;

function requestModule(name) {
  if (transformCache.has(name)) {
    return { name, cached: true, ms: 0 };
  }
  transformCache.set(name, true);
  transforms++;
  return { name, cached: false, ms: TRANSFORM_MS };
}

document.getElementById("dev-btn").addEventListener("click", () => {
  const first = requestModule("main.js");
  const second = requestModule("main.js");

  reportEl.textContent =
    "Dev server (transform on demand)\\n\\n" +
    "request main.js  → " + (first.cached ? "cache" : "transform " + first.ms + " ms") + "\\n" +
    "request main.js  → " + (second.cached ? "cache hit (0 ms)" : "transform") + "\\n\\n" +
    "modules transformed since start: " + transforms + "\\n" +
    "the dev server never bundles: it answers exactly\\n" +
    "what the browser asks for, once.";

  console.log("dev requests: transform", first.ms, "ms, then cache");
});

// ── HMR: patch only the module that changed ──
document.getElementById("hmr-btn").addEventListener("click", () => {
  transformCache.delete("paint.js");
  const patch = requestModule("paint.js");

  reportEl.textContent =
    "Hot Module Replacement\\n\\n" +
    "edit paint.js    → invalidate cache\\n" +
    "transform        → " + patch.ms + " ms\\n" +
    "send patch       → only paint.js\\n" +
    "other modules    → untouched\\n\\n" +
    "modules transformed since start: " + transforms + "\\n" +
    "no full reload, no re-running the whole graph.";

  console.log("HMR patched paint.js in", patch.ms, "ms");
});

// ── Build: the whole graph, once ──
document.getElementById("build-btn").addEventListener("click", () => {
  const start = performance.now();
  let total = 0;

  for (const name of MODULES) {
    requestModule(name);
    total += TRANSFORM_MS;
  }

  const graph = total + 120; // bundling + minifying the graph
  const wall = performance.now() - start;

  reportEl.textContent =
    "Production build (once)\\n\\n" +
    MODULES.map((name) => "transform " + name).join("\\n") + "\\n" +
    "bundle + minify\\n" +
    "emit assets with hashes\\n\\n" +
    "modules transformed: " + MODULES.length + "\\n" +
    "work done up front: " + graph + " ms (simulated)\\n" +
    "wall time in this page: " + wall.toFixed(1) + " ms\\n\\n" +
    "output: dist/assets/index-8f3a1c.js";

  console.log("build: transformed", MODULES.length, "modules, bundled once");
});`
	}
};
