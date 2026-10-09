// Pixel Art Editor — Lesson 20: The esbuild Bridge
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 20,
	title: 'The esbuild Bridge',
	description: `We felt the problem in the previous lesson. The browser loads every module with its own request, and it cannot start a module before its imports arrive:

\`\`\`
index.html → main.js → paint.js → buffer.js
                    → render.js → palette.js
\`\`\`

Five files, five round trips. On a fast local server you do not notice; on a real network the **waterfall** is the first thing a user feels.

There is a tool for exactly this. **esbuild** takes one entry point, follows the imports and writes a single file:

\`\`\`
npx esbuild src/main.js --bundle --outfile=dist/bundle.js --format=esm
\`\`\`

It is not magic — it does the three things you have already seen by hand: read the dependency graph, resolve the imports, emit the modules in dependency order. It just does them automatically, and fast. Ten lines of script replace the whole ceremony:

\`\`\`js
// build.mjs
import { build } from 'esbuild';

await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: 'dist/bundle.js'
});
\`\`\`

This lesson is the bridge. You bundle the project with the tool, watch the requests drop, and then notice the part esbuild does **not** solve: you still have to run it after every change. That is the door the next lesson walks through.`,
	task: `1. In your project: \`npm install --save-dev esbuild\` (or \`pnpm add -D esbuild\`).
2. Create \`build.mjs\` with the ten-line script above, and add \`"build": "node build.mjs"\` to your \`package.json\` scripts.
3. Run \`npm run build\` and look at the size of \`dist/bundle.js\`.
4. Change \`index.html\` to load only that file, then open the **Network** tab: the requests drop from five to one.
5. Press **Run esbuild** in this page to see the same transformation, and read the report: what did bundling *not* fix?`,
	concept: `**Bundling** — walking the import graph from an entry point and emitting a single file. The graph is the same one from the previous lessons; what changes is who executes the walk: a tool you install, instead of code you write.`,
	whyItMatters: `The waterfall is a deployment problem, not a code problem, and bundling is the standard answer. But a bundler you have to run by hand is another chore: edit, run, refresh, repeat. That missing piece — automation plus instant feedback — is exactly what the next lesson adds.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 20</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor — what esbuild does with the graph</h3>
  <div id="toolbar">
    <button id="before-btn">Show the waterfall</button>
    <button id="bundle-btn">Run esbuild</button>
  </div>
  <div id="panels">
    <section class="panel">
      <h4>Source modules</h4>
      <ul id="graph"></ul>
    </section>
    <section class="panel">
      <h4>esbuild output</h4>
      <pre id="bundle">Press Run esbuild.</pre>
    </section>
  </div>
  <p id="report">Five modules, five requests. Press Run esbuild.</p>
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
#before-btn, #bundle-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#before-btn:hover, #bundle-btn:hover { border-color: #8b8bcc; }
#panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 720px;
  max-width: 100%;
}
.panel {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  padding: 12px;
  min-height: 200px;
}
.panel h4 {
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8888aa;
}
#graph { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.module {
  font-family: monospace;
  font-size: 12px;
  color: #b0b0c8;
  border-left: 3px solid #3a3a5c;
  padding-left: 8px;
}
#bundle {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #b0b0c8;
  white-space: pre-wrap;
}
#report {
  color: #8888aa;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
  min-height: 56px;
  max-width: 660px;
}`,
		javascript: `// Pixel Art Editor — Lesson 20: The esbuild Bridge

const graphEl = document.getElementById("graph");
const bundleEl = document.getElementById("bundle");
const reportEl = document.getElementById("report");

// The same modules from the previous lesson — already in dependency order,
// which is the order esbuild emits them in. We do not resolve the graph here:
// that is exactly the part the tool does for us.
const MODULES = [
  { file: "src/buffer.js", bytes: 190, imports: [] },
  { file: "src/palette.js", bytes: 160, imports: [] },
  { file: "src/paint.js", bytes: 310, imports: ["src/buffer.js"] },
  { file: "src/render.js", bytes: 280, imports: ["src/palette.js"] },
  { file: "src/main.js", bytes: 420, imports: ["src/paint.js", "src/render.js"] }
];

const COMMAND = "npx esbuild src/main.js --bundle --outfile=dist/bundle.js --format=esm --minify";

function totalBytes() {
  return MODULES.reduce((sum, module) => sum + module.bytes, 0);
}

// ── Before: one request per module ──
function showWaterfall() {
  graphEl.innerHTML = "";

  for (const module of MODULES) {
    const item = document.createElement("li");
    item.className = "module";
    item.textContent =
      module.file +
      (module.imports.length > 0 ? "  →  " + module.imports.join(", ") : "") +
      "   (" + module.bytes + " B)";
    graphEl.appendChild(item);
  }

  reportEl.textContent =
    MODULES.length + " modules · " + totalBytes() + " bytes of source\\n" +
    "the browser needs one request per module";

  console.log("source:", MODULES.length, "modules,", totalBytes(), "bytes");
}

// ── After: one file, produced by esbuild ──
function runEsbuild() {
  const sourceBytes = totalBytes();
  const minifiedBytes = Math.round(sourceBytes * 0.62);

  bundleEl.textContent =
    "$ " + COMMAND + "\\n\\n" +
    "  dist/bundle.js   " + minifiedBytes + " B (minified)\\n\\n" +
    MODULES.map((module, index) => "  // " + (index + 1) + ". " + module.file).join("\\n") +
    "\\n\\n  → 1 file · 1 request";

  reportEl.textContent =
    "requests: " + MODULES.length + " → 1\\n" +
    "bytes: " + sourceBytes + " → " + minifiedBytes + " (minified)\\n\\n" +
    "what bundling does not fix: you still have to run it\\n" +
    "after every change — that is the next lesson";

  console.log("esbuild:", MODULES.length, "requests → 1,", sourceBytes, "→", minifiedBytes, "bytes");
  console.log("run it yourself with:", COMMAND);
}

document.getElementById("before-btn").addEventListener("click", showWaterfall);
document.getElementById("bundle-btn").addEventListener("click", runEsbuild);

showWaterfall();
console.log("esbuild bridge ready — bundle the project with the real tool");`
	}
};
