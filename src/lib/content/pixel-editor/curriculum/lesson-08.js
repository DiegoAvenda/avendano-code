// Lesson 8 — Listen to the User
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 8,
	title: 'Listen to the User',
	description: `The editor is useless if the user cannot interact with it. We need to **listen for events** — things that happen like clicks, mouse movements, and key presses.

We use \`addEventListener\` to register event handlers:

\`\`\`js
element.addEventListener("click", function(event) {
  // handle the click
});
\`\`\`

The \`event\` object contains information about what happened — where the mouse was, which button was pressed, etc.

We'll implement pointer events (mouse, touch, pen) to interact with a canvas.`,
	task: `1. Look at the pointer event listeners — pointerdown, pointermove, pointerup.
2. Click on the canvas and watch the coordinates update.
3. Drag across the canvas to see continuous movement.
4. Try right-clicking to see the different button values.
5. Add a keyboard event listener for a key like 'c' to clear.`,
	concept: `**Events and event listeners** — responding to user actions like clicks, movements, and key presses.`,
	whyItMatters: `Events are how browsers tell JavaScript that something happened. Without events, our code would run once and stop. With events, our code can react continuously to user input, creating interactive applications.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 8</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <canvas id="canvas"></canvas>
  <p id="coords">Move your mouse over the canvas</p>
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
  background: #2a2a3e;
  border: 2px solid #333;
  cursor: crosshair;
}
#coords { font-size: 12px; opacity: 0.6; }`,
		javascript: `// Pixel Art Editor — Lesson 8: Listen to the User

const canvas = document.getElementById("canvas");
const coords = document.getElementById("coords");

let isPressed = false;

// Pointer down (mouse/touch/pen press)
canvas.addEventListener("pointerdown", function(event) {
  isPressed = true;
  canvas.setPointerCapture(event.pointerId);
  updateCoords(event);
  console.log("Pointer down at:", event.clientX, event.clientY);
});

// Pointer move (drag)
canvas.addEventListener("pointermove", function(event) {
  if (isPressed) {
    updateCoords(event);
  }
});

// Pointer up (release)
canvas.addEventListener("pointerup", function(event) {
  isPressed = false;
  console.log("Pointer up");
});

// Prevent context menu on right-click
canvas.addEventListener("contextmenu", function(event) {
  event.preventDefault();
});

function updateCoords(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(event.clientX - rect.left);
  const y = Math.floor(event.clientY - rect.top);
  coords.textContent = "Position: " + x + ", " + y + " | Button: " + event.button;
}

console.log("Event listeners ready");`
	}
};
