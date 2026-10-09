export default {
	id: 6,
	title: 'Ask a Question',
	description: `A comparison answers a yes-or-no question. JavaScript represents those answers with the Boolean values \`true\` and \`false\`.`,
	task: `1. Change \`paintedPixels\`.\n2. Predict whether the result will be true or false.\n3. Run the code to check your prediction.`,
	concept: `**Booleans and comparisons** — \`>\`, \`<\`, and \`===\` compare values and produce \`true\` or \`false\`.`,
	whyItMatters: `A program needs Boolean answers before it can decide what to do.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 6</title><link rel="stylesheet" href="style.css" /></head><body><p>Predict the Boolean value, then inspect it in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 6: Ask a Question
const paintedPixels = 3;
const isDrawing = paintedPixels > 0;
console.log("Has the drawing started? " + isDrawing);`
	}
};
