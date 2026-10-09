export default {
	id: 8,
	title: 'Read Errors and Inspect Values',
	description: `Errors are feedback from the program. The console tells you where execution stopped, while \`console.log\` lets you check a value before it causes a problem.`,
	task: `1. Run the program and inspect the console.\n2. Change \`pixelSize\` to 0 and run again.\n3. Read the warning, then restore a positive value.`,
	concept: `**Debugging** — inspect values, make one small change, and use an error or warning to narrow down the cause.`,
	whyItMatters: `Everyone writes bugs. A repeatable way to investigate them makes programming much less mysterious.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 8</title><link rel="stylesheet" href="style.css" /></head><body><p>Use the console to inspect a value and its warning.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 8: Read Errors and Inspect Values
const pixelSize = 16;
console.log("pixelSize is", pixelSize);
if (pixelSize <= 0) {
  console.warn("Pixel size must be greater than zero");
} else {
  console.log("Each pixel is " + pixelSize + "px wide");
}`
	}
};
