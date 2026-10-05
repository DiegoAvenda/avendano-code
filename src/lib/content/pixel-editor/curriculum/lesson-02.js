// Lesson 2 — Give the Code a Job
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 2,
	title: 'Give the Code a Job',
	description: `We will need to perform the same operation many times in our editor. Instead of writing the same code repeatedly, we can give that operation a name using a **function**.

A function is a reusable block of code that can take inputs (called **parameters**) and return a result. We can call the function whenever we need that operation.

For our pixel editor, we'll create a function that calculates how large each pixel should be based on the canvas size and grid dimensions.`,
	task: `1. Look at the \`getPixelSize\` function — it takes two parameters and returns a value.
2. Change the canvas width to 400 and grid width to 20.
3. The function will automatically calculate the new pixel size.
4. Add a call to \`getPixelSize\` with different numbers to see how it works.
5. Create your own function called \`getTotalPixels\` that multiplies width by height.`,
	concept: `**Functions, parameters, and return values** — naming reusable operations that accept inputs and produce outputs.`,
	whyItMatters: `Functions let us write code once and use it many times. This makes our code shorter, easier to read, and easier to fix — if we change the function, every place that uses it gets the update automatically.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 2</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas"></canvas>
  <p id="info"></p>
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
#info { font-size: 12px; opacity: 0.6; }`,
		javascript: `// Pixel Art Editor — Lesson 2: Give the Code a Job

// Canvas dimensions
const canvasWidth = 400;
const canvasHeight = 400;

// Grid dimensions
const gridWidth = 20;
const gridHeight = 20;

// Function to calculate pixel size
function getPixelSize(canvasSize, gridSize) {
  return canvasSize / gridSize;
}

// Use the function
const pixelWidth = getPixelSize(canvasWidth, gridWidth);
const pixelHeight = getPixelSize(canvasHeight, gridHeight);

// Apply to canvas
const canvas = document.getElementById("canvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Display info
const info = document.getElementById("info");
info.textContent = "Pixel size: " + pixelWidth + "x" + pixelHeight;

console.log("Pixel width:", pixelWidth);
console.log("Pixel height:", pixelHeight);`
	}
};
