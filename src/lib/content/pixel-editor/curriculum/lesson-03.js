// Lesson 3 — Make Decisions
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 3,
	title: 'Make Decisions',
	description: `Our editor needs to make decisions. Is the mouse inside the canvas? Is the drawing tool active? Should we erase or draw?

We use **conditional statements** to make these decisions. The core concepts are:

- **Boolean values**: \`true\` or \`false\`
- **Comparisons**: \`>\`, \`<\`, \`===\`, \`!==\` that produce true/false
- **if/else**: "if this is true, do this; otherwise, do that"
- **Logical operators**: \`&&\` (and), \`||\` (or) to combine conditions

We'll build a function that checks if a point is inside the canvas bounds.`,
	task: `1. Look at the \`isInsideCanvas\` function — it combines multiple conditions with \`&&\`.
2. Change the \`testX\` and \`testY\` values to different numbers.
3. Watch the result change from true to false based on your values.
4. Try values that are exactly on the edge (equal to width or height).
5. Add another condition using \`||\` (or) to handle a special case.`,
	concept: `**Boolean values, comparisons, if/else, and logical operators** — making decisions in code based on conditions.`,
	whyItMatters: `Interactive programs constantly make decisions. Is the user clicking here? Should this button be enabled? Conditional logic is how programs respond to different situations.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 3</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas"></canvas>
  <p id="result"></p>
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
#canvas {
  background: #2a2a3e;
  border: 2px solid #333;
}
#result { font-size: 13px; opacity: 0.8; }`,
		javascript: `// Pixel Art Editor — Lesson 3: Make Decisions

const width = 20;
const height = 20;

// Function to check if a point is inside the canvas
function isInsideCanvas(x, y, canvasWidth, canvasHeight) {
  return (
    x >= 0 &&
    x < canvasWidth &&
    y >= 0 &&
    y < canvasHeight
  );
}

// Test values
const testX = 10;
const testY = 15;

const inside = isInsideCanvas(testX, testY, width, height);

const result = document.getElementById("result");
if (inside) {
  result.textContent = "Point (" + testX + ", " + testY + ") is INSIDE the canvas";
  result.style.color = "#4ade80";
} else {
  result.textContent = "Point (" + testX + ", " + testY + ") is OUTSIDE the canvas";
  result.style.color = "#ef4444";
}

console.log("Is inside:", inside);`
	}
};
