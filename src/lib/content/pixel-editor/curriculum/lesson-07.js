// Pixel Art Editor — Lesson 7: Talk to the Page
// Prose + starter code for a single lesson. Loaded on demand by ../lessons.js.
export default {
	id: 7,
	title: 'Talk to the Page',
	description: `The editor needs controls outside the canvas — buttons, labels, color swatches. Those controls are **HTML** — the content of a page: text, boxes — styled with **CSS** — how it looks: colours, layout. JavaScript can read and modify the page using the **DOM** (Document Object Model): the page seen as a tree of boxes that code can create, move and remove.

Key DOM operations:
- \`document.getElementById(id)\` — find an element
- \`element.textContent\` — change text
- \`element.classList\` — add/remove CSS classes
- \`document.createElement(tag)\` — create new elements

We'll create a simple toolbar with a button that we can control from JavaScript.`,
	task: `1. Look at how we select the button with \`getElementById\`.
2. Change the button text using \`textContent\`.
3. Add a click listener that changes the text when clicked.
4. Use \`classList.add\` to add a CSS class when the button is clicked.
5. Create a new element and append it to the page.`,
	concept: `**DOM manipulation** — JavaScript can find, read, create, and modify HTML elements on the page.`,
	whyItMatters: `The DOM is how JavaScript interacts with the page. Every interactive element — buttons, inputs, color pickers — is controlled through DOM operations. This is how we build user interfaces that respond to user actions.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pixel Art Editor — Lesson 7</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h3>Pixel Art Editor</h3>
  <div id="toolbar">
    <button id="clear-btn">Clear Canvas</button>
    <span id="status">Ready</span>
  </div>
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
#toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
button {
  background: #3a3a5c;
  color: #e0e0e0;
  border: 1px solid #555;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
button:hover { background: #4a4a6c; }
button.clicked {
  background: #5a5a8c;
  border-color: #8b8bcc;
}
#status { font-size: 12px; opacity: 0.6; }`,
		javascript: `// Pixel Art Editor — Lesson 7: Talk to the Page

// Select elements from the page
const clearBtn = document.getElementById("clear-btn");
const status = document.getElementById("status");

// Change button text
clearBtn.textContent = "Clear Canvas";

// Add click handler
clearBtn.addEventListener("click", function() {
  // Update status text
  status.textContent = "Canvas cleared!";

  // Add a CSS class
  clearBtn.classList.add("clicked");

  // Remove the class after a moment
  setTimeout(function() {
    clearBtn.classList.remove("clicked");
    status.textContent = "Ready";
  }, 1000);

  console.log("Clear button clicked");
});

console.log("DOM ready");`
	}
};
