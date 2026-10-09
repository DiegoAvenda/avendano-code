export default {
	id: 4,
	title: 'Update a Value',
	description: `Programs often remember a current value and then replace it with a new one. Here the program adds to a counter one instruction at a time.`,
	task: `1. Run the program and read the counter in the console.\n2. Find the line that adds one.\n3. Change it so the program adds two.`,
	concept: `**Assignment** — \`count = count + 1\` calculates a new value and stores it back in the variable.`,
	whyItMatters: `Drawing, undo, and tools all depend on state changing in response to an action.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 4</title><link rel="stylesheet" href="style.css" /></head><body><p>Follow the counter in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 4: Update a Value
let paintedPixels = 0;
paintedPixels = paintedPixels + 1;
console.log("Painted pixels: " + paintedPixels);`
	}
};
