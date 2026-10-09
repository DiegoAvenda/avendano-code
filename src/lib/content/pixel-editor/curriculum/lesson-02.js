export default {
	id: 2,
	title: 'Work With Values',
	description: `Programs work with values: numbers for quantities and text for labels. JavaScript can combine numbers with arithmetic and join text into a message.`,
	task: `1. Change \`width\` and \`height\`.\n2. Run the code and read the calculated total.\n3. Change the editor name.`,
	concept: `**Numbers, text, and expressions** — values can be stored, combined, and shown to the user.`,
	whyItMatters: `Every editor setting, colour label, and pixel count starts as a value.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 2</title><link rel="stylesheet" href="style.css" /></head><body><p>Read the calculated result in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 2: Work With Values
const editorName = "Pixel Art Editor";
const width = 8;
const height = 8;
const cells = width * height;
console.log(editorName + " has " + cells + " cells");`
	}
};
