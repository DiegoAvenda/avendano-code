// Lesson 1 — Your First Pixel
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 1,
	title: 'Your First Pixel',
	description: `We need to tell our pixel editor how large the canvas should be. In JavaScript, we use **variables** to remember values that our program needs.

Variables are like labeled boxes where we store information. Once we give a value a name, we can use that name throughout our code.

We'll use \`const\` (short for "constant") to store the canvas dimensions. The \`const\` keyword means the value won't change — perfect for fixed settings like canvas size.`,
	task: `1. Find the \`const width = 16;\` and \`const height = 16;\` lines.
2. Change the width to 20 and height to 20.
3. Watch the canvas resize automatically.
4. Try changing the pixel size variable to see each cell get larger or smaller.
5. Experiment with different numbers to understand how variables control the layout.`,
	concept: `**Variables and const** — storing values with names so the program can remember and use them.`,
	whyItMatters: `Every program needs to remember values. Variables are how we do that. By storing dimensions in variables, we can change them in one place and have the whole canvas adjust automatically.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 1</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas"></canvas>
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
}`,
		javascript: `// Pixel Art Editor — Lesson 1: Your First Pixel

// These variables store the canvas dimensions
const width = 16;
const height = 16;
const pixelSize = 32;

// Get the canvas element from the page
const canvas = document.getElementById("canvas");

// Set the canvas size using our variables
canvas.width = width * pixelSize;
canvas.height = height * pixelSize;

console.log("Canvas size:", canvas.width, "x", canvas.height);
console.log("Grid dimensions:", width, "x", height);`
	}
};
