// Lesson 18 — The Browser Is Already a Module System
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 18,
	title: 'The Browser Is Already a Module System',
	description: `Our app is split into modules now, and it still works with no build step — the browser understands \`<script type="module">\` and \`import\` natively.

That is a real capability, not a limitation. Open DevTools → **Network** and reload: every module is a request. The browser starts at the entry point and then walks the graph:

\`\`\`
index.html
   ↓
main.js
   ↓
paint.js ─→ buffer.js
   ├─────→ renderer.js
   └─────→ history.js
\`\`\`

Each arrow is a round trip. On a fast local connection you will not notice; on a slow connection, the *waterfall* is the first thing a real user feels.

So the question of this bridge is not "are modules bad?" — they are not. The question is: **what happens when the project grows and we need to transform, optimise, organise and build it for production?**`,
	task: `1. Press **Load modules** to simulate the browser walking the graph: each module costs one request.
2. Read the waterfall in the report — each \`─\` is one round trip, and later modules cannot start until their imports arrive.
3. Note the totals: how many requests, and how long the whole chain takes.
4. Press **Load bundle** to load the same application as a single pre-built file.
5. Compare the two. Then decide: which of the two do you want in development, and which in production?`,
	concept: `**The module waterfall** — native ES modules are loaded as separate requests, and the dependency graph turns into sequential round trips. A bundler trades many small requests for one bigger one.`,
	whyItMatters: `This is the exact problem a build tool exists to solve. Once you can see the waterfall and count the round trips, "why do we need a bundler?" stops being an article you memorise and becomes something you measured.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 18</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>The browser is already a module system</h3>
  <div id="controls">
    <button id="load-btn">Load modules</button>
    <button id="bundle-btn">Load bundle</button>
  </div>
  <pre id="report">Press a button to simulate loading the app.</pre>
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
#load-btn, #bundle-btn {
  background: #2a2a44;
  color: #e0e0e0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#load-btn:hover, #bundle-btn:hover { border-color: #8b8bcc; }
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
  min-width: 460px;
  min-height: 220px;
}`,
		javascript: `// Pixel Art Editor — Lesson 18: The Browser Is Already a Module System

const reportEl = document.getElementById("report");

// The same dependency graph from the previous lesson.
const MODULES = [
  { name: "main.js", deps: [], ms: 40 },
  { name: "paint.js", deps: ["main.js"], ms: 60 },
  { name: "buffer.js", deps: ["paint.js"], ms: 25 },
  { name: "renderer.js", deps: ["paint.js"], ms: 35 },
  { name: "history.js", deps: ["paint.js"], ms: 25 }
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadModule(module) {
  await wait(module.ms);
  return module.name;
}

async function loadModules() {
  reportEl.textContent = "Loading modules…";
  const lines = [];
  let elapsed = 0;
  let requests = 0;

  for (const module of MODULES) {
    const start = performance.now();
    await loadModule(module);
    elapsed += performance.now() - start;
    requests++;
    lines.push(
      module.name.padEnd(13) + "─".repeat(requests) + " " + elapsed.toFixed(0) + " ms"
    );
  }

  reportEl.textContent =
    "Module waterfall\\n\\n" + lines.join("\\n") +
    "\\n\\nrequests: " + requests +
    "\\nwall time: " + elapsed.toFixed(0) + " ms" +
    "\\n\\nevery arrow is a round trip: the browser cannot\\n" +
    "start paint.js before main.js arrives.";

  console.log("Module waterfall:", requests, "requests,", elapsed.toFixed(0), "ms");
}

async function loadBundle() {
  reportEl.textContent = "Loading bundle…";
  const start = performance.now();
  await wait(90); // one file with everything inside
  const elapsed = performance.now() - start;

  reportEl.textContent =
    "Single bundle\\n\\n" + "bundle.js".padEnd(13) + "─" + " " + elapsed.toFixed(0) + " ms" +
    "\\n\\nrequests: 1" +
    "\\nwall time: " + elapsed.toFixed(0) + " ms" +
    "\\n\\nsame application, one round trip.\\n" +
    "the build step exists to turn the graph into this file.";

  console.log("Bundle:", elapsed.toFixed(0), "ms, 1 request");
}

document.getElementById("load-btn").addEventListener("click", loadModules);
document.getElementById("bundle-btn").addEventListener("click", loadBundle);

console.log("Simulating a", MODULES.length, "-module waterfall");`
	}
};
