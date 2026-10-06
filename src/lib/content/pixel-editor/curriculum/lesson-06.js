// Pixel Art Editor — Lesson 6: Describe Things
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 6,
	title: 'Describe Things',
	description: `The editor is starting to remember several things at once: the selected color, the active tool and the size of the grid.

Three loose variables work for a while, but they belong together — they describe **the state of the editor**. An object groups related values under a single name:

\`\`\`
{
  selectedColor: "#e94560",
  tool: "pencil",
  gridSize: 16
}
\`\`\`

Now the whole state can be read, passed to a function and printed as one thing.`,
	task: `1. Look at the \`editorState\` object — it groups three related values.
2. Change \`selectedColor\` to another palette color and run again.
3. Add a new property such as \`zoom: 1\` and display it.
4. Reach a value with dot notation (\`editorState.tool\`) and again with bracket notation (\`editorState["tool"]\`).
5. Log the whole object to the console and expand it in DevTools.`,
	concept: `**Objects and properties** — grouping related values together to model an entity or a piece of application state.`,
	whyItMatters: `The editor's state will keep growing. Keeping it in one object means we can pass it around as a unit, print it, and later decide how to store it — instead of chasing a growing pile of loose variables.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 6</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <div id="state-display"></div>
  <div id="cells-display"></div>
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
#state-display {
  background: #161628;
  border: 1px solid #2a2a44;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
}
#cells-display {
  color: #8888aa;
  font-size: 13px;
}`,
		javascript: `// Pixel Art Editor — Lesson 6: Describe Things

// One object describes everything the editor needs to remember right now.
const editorState = {
  selectedColor: "#e94560",
  tool: "pencil",
  gridSize: 16
};

const stateDisplay = document.getElementById("state-display");
const cellsDisplay = document.getElementById("cells-display");

function describe(state) {
  return "Tool: " + state.tool +
    " · Color: " + state.selectedColor +
    " · Grid: " + state.gridSize + "×" + state.gridSize;
}

stateDisplay.textContent = describe(editorState);

// Dot notation and bracket notation reach the same value
const cells = editorState.gridSize * editorState["gridSize"];
cellsDisplay.textContent = "Grid holds " + cells + " cells";

console.log("Editor state:", editorState);
console.log("Bracket access:", editorState["tool"]);`
	}
};
