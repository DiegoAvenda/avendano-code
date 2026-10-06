// Pixel Art Editor — Lesson 5: Work With Collections
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 5,
	title: 'Work With Collections',
	description: `Our editor needs to remember many values — colors, pixels, tools. JavaScript provides **arrays** for storing collections of values.

An array is an ordered list where each item has an index (position). We can:
- Read values by index: \`colors[0]\`
- Write values by index: \`colors[1] = "red"\`
- Add values: \`colors.push("blue")\`
- Get the length: \`colors.length\`

We'll create a color palette array and use it to render color swatches.`,
	task: `1. Look at the \`palette\` array — it stores color strings.
2. Change one of the colors to a different hex value.
3. Add a new color to the array using \`push\`.
4. The loop automatically adjusts to include the new color.
5. Try accessing a specific color by index and printing it to the console.`,
	concept: `**Arrays, indexes, and length** — storing and accessing ordered collections of values.`,
	whyItMatters: `Arrays are how we handle lists of things in JavaScript. Our editor will store colors, pixels, and even history in arrays. Understanding arrays is essential for managing collections of data.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 5</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <div id="palette"></div>
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
#palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 400px;
}
.swatch {
  width: 48px;
  height: 48px;
  border: 2px solid #333;
  border-radius: 4px;
}`,
		javascript: `// Pixel Art Editor — Lesson 5: Work With Collections

// Array of color values
const palette = [
  "#1a1a2e",
  "#e94560",
  "#48dbfb",
  "#ffdd59",
  "#2ecc71"
];

// Get the palette container
const paletteEl = document.getElementById("palette");

// Loop through the array and create swatches
for (let i = 0; i < palette.length; i++) {
  const color = palette[i];

  // Create a div for each color
  const swatch = document.createElement("div");
  swatch.className = "swatch";
  swatch.style.background = color;
  swatch.title = "Color " + i + ": " + color;

  // Add it to the page
  paletteEl.appendChild(swatch);
}

console.log("Palette has", palette.length, "colors");
console.log("First color:", palette[0]);
console.log("Last color:", palette[palette.length - 1]);`
	}
};
