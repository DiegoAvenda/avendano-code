export default {
	id: 3,
	title: 'Name What Changes',
	description: `A variable gives a value a useful name. Use \`const\` for a setting that stays fixed and \`let\` for a value that will change while the program runs.`,
	task: `1. Change \`gridSize\`.\n2. Change \`selectedColor\`.\n3. Run the code and inspect both messages.`,
	concept: `**Variables** — \`const\` names a fixed value; \`let\` names a value that can be updated.`,
	whyItMatters: `Clear names make a program readable and let one setting control several results.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 3</title><link rel="stylesheet" href="style.css" /></head><body><p>Inspect the named values in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 3: Name What Changes
const gridSize = 16;
let selectedColor = "cyan";
selectedColor = "magenta";
console.log("Grid: " + gridSize + " · Color: " + selectedColor);`
	}
};
