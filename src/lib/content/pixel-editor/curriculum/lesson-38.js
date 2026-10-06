// Diagram Builder — Lesson 38: Memory Management
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 38,
	title: 'Memory Management',
	description: `The last lesson of the module is about a failure that is invisible until it is expensive:

\`\`\`
object created
      ↓
resource attached   (a listener, a timer, a DOM node, a subscription)
      ↓
object removed from the model
      ↓
resource still alive
      ↓
memory leak
\`\`\`

Nothing throws, nothing logs, the app keeps working — and the memory graph keeps growing. Editors are especially good at producing this failure, because they create and destroy nodes, listeners, references and DOM elements all day.

The tool for listeners is \`AbortController\`. One controller can own many listeners, and a single \`abort()\` removes all of them:

\`\`\`
const controller = new AbortController();
emitter.on("move", handler, { signal: controller.signal });
controller.abort();   // handler is gone
\`\`\`

Now the lifetime of the listeners is tied to the lifetime of the node that owns them. Cleanup stops being a list of rules to remember and becomes something you can measure.`,
	task: `1. Press **Create and drop 500 nodes (leaky)** and read the live listener count — it never goes back down.
2. Open DevTools → Memory, take a heap snapshot, and look for the handler functions that are still retained.
3. Press **Cleanup with AbortController** and watch the count drop to zero.
4. Read \`emitter.on\`: the cleanup is three lines, and it is attached to the signal, not to the caller.
5. Ask: which resources in the two projects you built still have no owner responsible for releasing them?`,
	concept: `**Resource lifetime** — every resource attached to an object (listener, timer, subscription, DOM node) must be released when the object dies, and \`AbortController\` gives many resources a single owner and a single release point.`,
	whyItMatters: `Leaks are the failure mode that no test catches and no stack trace points at. Once you have seen the count go up and stay up, "cleanup" stops being a style preference and becomes part of the contract between a component and the resources it creates.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diagram Builder — Lesson 38</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Memory Management — who releases the listeners?</h3>
  <div id="toolbar">
    <button id="leak-btn">Create and drop 500 nodes (leaky)</button>
    <button id="clean-btn">Cleanup with AbortController</button>
  </div>
  <div id="meter"><div id="meter-fill"></div></div>
  <p id="report">No nodes yet. Live listeners: 0</p>
  <script src="script.js"></script>
</body>
</html>`,
		css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #12122a;
  color: #e8e8f0;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 14px;
}
h3 { font-size: 13px; opacity: 0.7; }
#toolbar { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
#leak-btn, #clean-btn {
  background: #2a2a44;
  color: #e8e8f0;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#leak-btn:hover { border-color: #e94560; }
#clean-btn:hover { border-color: #2ecc71; }
#meter {
  width: 520px;
  max-width: 100%;
  height: 14px;
  background: #1e1e34;
  border: 1px solid #2a2a44;
  border-radius: 7px;
  overflow: hidden;
}
#meter-fill {
  height: 100%;
  width: 0%;
  background: #e94560;
  transition: width 0.2s, background 0.2s;
}
#report { color: #b0b0c8; font-size: 13px; text-align: center; white-space: pre-line; min-height: 60px; }`,
		javascript: `// Diagram Builder — Lesson 38: Memory Management

const reportEl = document.getElementById("report");
const meterFill = document.getElementById("meter-fill");

// A tiny event emitter, like the one a real editor would use.
class Emitter {
  constructor() {
    this.listeners = new Set();
  }

  on(type, handler, options = {}) {
    const entry = { type, handler };
    this.listeners.add(entry);

    if (options.signal) {
      options.signal.addEventListener("abort", () => this.listeners.delete(entry));
    }
    return entry;
  }

  emit(type, payload) {
    for (const entry of this.listeners) {
      if (entry.type === type) entry.handler(payload);
    }
  }

  get size() {
    return this.listeners.size;
  }
}

const emitter = new Emitter();
let model = [];
let controllers = [];
let lastMove = "";

function createNode(index, controller) {
  const node = { id: "n" + index, x: index * 4, y: index * 2 };

  // Every node listens for "move" events for as long as it exists.
  emitter.on(
    "move",
    (payload) => {
      lastMove = node.id + " → " + payload.x + "," + payload.y;
    },
    controller ? { signal: controller.signal } : {}
  );

  return node;
}

function updateReport(message) {
  const live = emitter.size;
  reportEl.textContent = message + "\\nLive listeners: " + live;

  meterFill.style.width = Math.min(100, (live / 500) * 100) + "%";
  meterFill.style.background = live === 0 ? "#2ecc71" : live > 500 ? "#e94560" : "#ffd166";
}

document.getElementById("leak-btn").addEventListener("click", () => {
  const created = [];
  for (let i = 0; i < 500; i++) created.push(createNode(model.length + i, null));

  model = model.concat(created);
  emitter.emit("move", { x: 10, y: 20 });

  // The nodes leave the model … but their listeners never left the emitter.
  model = [];

  updateReport(
    "500 nodes created and dropped without cleanup." +
      "\\nThe model is empty again (" + model.length + " nodes)," +
      "\\nbut the listeners are still retained by the emitter."
  );

  console.log("Leak: model is empty but the emitter still holds", emitter.size, "listeners");
});

document.getElementById("clean-btn").addEventListener("click", () => {
  // 1. Create nodes, each one owning its listeners through a controller.
  controllers = Array.from({ length: 500 }, () => new AbortController());

  const created = controllers.map((controller, index) =>
    createNode(model.length + index, controller)
  );
  model = model.concat(created);

  updateReport("500 nodes created, each with its own AbortController.");

  // 2. Destroy the nodes: one abort per node releases everything it owned.
  for (const controller of controllers) controller.abort();
  controllers = [];
  model = [];

  emitter.emit("move", { x: 0, y: 0 });
  updateReport(
    "Nodes destroyed and every listener released with abort()." +
      "\\nNothing is retained: the count is back to zero."
  );

  console.log("After abort:", emitter.size, "listeners — last move event:", lastMove);
});

updateReport("No nodes yet.");
console.log("Emitter ready. Watch the listener count.");`
	}
};
