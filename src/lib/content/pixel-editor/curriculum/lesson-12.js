// Pixel Art Editor — Lesson 4: Repeat the Work
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 12,
	title: 'Repeat the Work',
	description: `A pixel editor contains many pixels. We cannot write the same instruction hundreds of times. Instead, we use **loops** to repeat work.

Loops let us execute code multiple times without repeating ourselves. The two main types are:

- **for loops**: Repeat a specific number of times
- **while loops**: Repeat while a condition is true

We'll use a for loop to draw a grid of pixels. The loop will visit every position and draw a rectangle there.`,
	task: `1. Look at the nested for loops — the outer loop iterates over rows (y), the inner over columns (x).
2. Change the grid size to 10x10.
3. The loops automatically adjust to the new size.
4. Try changing the colors in the loop to create a different pattern.
5. Add a third value (like an alternating pattern) using the loop counter.`,
	concept: `**For loops and iteration** — repeating operations multiple times without writing duplicate code.`,
	whyItMatters: `Without loops, we'd need to write the same drawing code 400 times for a 20×20 grid. Loops make it possible to handle hundreds or thousands of items with just a few lines of code.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 12</title>
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
  width: 400px;
  height: 400px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 2px solid #333;
}`,
		javascript: `// Pixel Art Editor — Lesson 12: Repeat the Work

const gridSize = 16;
const pixelSize = 25;

const canvas = document.getElementById("canvas");
canvas.width = gridSize * pixelSize;
canvas.height = gridSize * pixelSize;

const ctx = canvas.getContext("2d");

// Draw a grid using nested loops
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    // Calculate pixel position
    const posX = x * pixelSize;
    const posY = y * pixelSize;

    // Alternate colors for a checkerboard pattern
    const isLight = (x + y) % 2 === 0;
    ctx.fillStyle = isLight ? "#2a2a3e" : "#1a1a2e";

    // Draw the pixel
    ctx.fillRect(posX, posY, pixelSize, pixelSize);
  }
}

console.log("Drew", gridSize * gridSize, "pixels");`
	}
};
