// Lesson 19 — Build It Ourselves
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 19,
	title: 'Build It Ourselves',
	description: `We know the problem now: the browser loads modules as a waterfall, and for production we would rather ship one optimised file. So let's build a tiny bundler and see the whole pipeline with our own eyes:

\`\`\`
entry → dependency graph → order → transform → bundle → output
\`\`\`

We are not trying to recreate Vite. The point is to understand **what problem a build tool solves** — and to see that the answer is mechanical:

1. Start at the entry point and read its \`import\` statements.
2. Do the same for every module you reach; that is the graph.
3. Put the modules in an order where dependencies come first.
4. Rewrite the \`import\` lines and wrap each module in a function.
5. Emit one file plus a tiny loader that runs the modules on demand.`,
	task: `1. Press **Build** and read the step log: graph, order, output.
2. Look at the module map: three files with real \`import\` statements inside strings.
3. Follow \`resolveGraph\` — it is only a queue over the dependency edges.
4. Read the generated bundle: each module became a function, and the \`import\` lines are gone.
5. Add a fourth module and import it from \`main.js\`. The bundler should handle it without any change to the algorithm.`,
	concept: `**Bundling** — walking the dependency graph from an entry point, ordering it so dependencies come first, transforming each module, and emitting a single file with a tiny runtime loader.`,
	whyItMatters: `Knowing what the tool does is what lets you debug it: a circular import, a module that ended up in the wrong chunk, or an unexpected duplicate dependency are all visible once you have seen the graph. Tools stop being magic the moment you have built a small one yourself.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 19</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Build it ourselves — a 40-line bundler</h3>
  <div id="controls">
    <button id="build-btn">Build</button>
  </div>
  <pre id="output">Press Build to walk the graph and emit a bundle.</pre>
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
#build-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#build-btn:hover { border-color: #8b8bcc; }
#output {
  background: #111122;
  border: 1px solid #2a2a44;
  border-radius: 6px;
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #b0b0c8;
  white-space: pre;
  width: 640px;
  min-height: 260px;
}`,
		javascript: `// Pixel Art Editor — Lesson 19: Build It Ourselves

const outputEl = document.getElementById("output");

// ── Our "source files", as a map of strings ──
const MODULES = {
  "main.js": \`import { fill } from "./paint.js";
import { render } from "./render.js";

const pixels = new Uint8Array(16 * 16);
fill(pixels, 16, 0, 1);
render(pixels, 16);
console.log("app started", pixels.length);\`,
  "paint.js": \`export function fill(pixels, width, x, y) {
  pixels[y * width + x] = 1;
}\`,
  "render.js": \`import { toHex } from "./palette.js";

export function render(pixels, width) {
  console.log("rendering", pixels.length, toHex(1));
}\`,
  "palette.js": \`export function toHex(index) {
  return ["#000", "#e94560", "#48dbfb"][index];
}\`
};

// entry → dependency graph
function resolveGraph(entry) {
  const graph = {};
  const queue = [entry];

  while (queue.length > 0) {
    const name = queue.shift();
    if (graph[name]) continue;

    const code = MODULES[name];
    if (code === undefined) throw new Error("Missing module: " + name);

    const deps = [...code.matchAll(/from\\s+"([^"]+)"/g)]
      .map((match) => match[1].replace("./", ""));

    graph[name] = deps;
    queue.push(...deps);
  }

  return graph;
}

// dependencies first
function order(graph, entry) {
  const ordered = [];
  const seen = new Set();

  function visit(name) {
    if (seen.has(name)) return;
    seen.add(name);
    for (const dep of graph[name]) visit(dep);
    ordered.push(name);
  }

  visit(entry);
  return ordered;
}

// transform: strip imports, wrap each module in a function
function bundle(entry) {
  const graph = resolveGraph(entry);
  const ordered = order(graph, entry);

  const modules = ordered
    .map((name) => {
      const body = MODULES[name]
        .replace(/^import[^;]+;$/gm, "")
        .replace(/export /g, "");
      return "  " + JSON.stringify(name) + ": function (exports) {\\n" +
        body.split("\\n").map((line) => "    " + line).join("\\n") +
        "\\n  }";
    })
    .join(",\\n");

  return {
    graph,
    ordered,
    code:
      "(function () {\\n" +
      "  const modules = {\\n" + modules + "\\n  };\\n" +
      "  const cache = {};\\n" +
      "  function require(name) {\\n" +
      "    if (cache[name]) return cache[name];\\n" +
      "    const exports = {};\\n" +
      "    cache[name] = exports;\\n" +
      "    modules[name](exports);\\n" +
      "    return exports;\\n" +
      "  }\\n" +
      "  require(" + JSON.stringify(entry) + ");\\n" +
      "})();"
  };
}

document.getElementById("build-btn").addEventListener("click", () => {
  const result = bundle("main.js");

  outputEl.textContent =
    "1. dependency graph\\n" +
    JSON.stringify(result.graph, null, 2) +
    "\\n\\n2. order (dependencies first)\\n" +
    result.ordered.join(" → ") +
    "\\n\\n3. output\\n" + result.code;

  console.log("Bundle built:", result.ordered.join(" → "));
});`
	}
};
