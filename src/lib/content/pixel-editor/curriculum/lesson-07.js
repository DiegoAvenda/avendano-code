export default {
	id: 7,
	title: 'Choose What Happens',
	description: `An \`if\` statement chooses an instruction based on a Boolean answer. It lets the program respond differently to different situations.`,
	task: `1. Set \`hasColor\` to \`false\`.\n2. Run the program.\n3. Set it back to \`true\` and compare the message.`,
	concept: `**if/else** — run one branch when a condition is true and another when it is false.`,
	whyItMatters: `An editor uses decisions to choose between drawing, erasing, saving, and warning the user.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 7</title><link rel="stylesheet" href="style.css" /></head><body><p>Change the condition and inspect the chosen message in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 7: Choose What Happens
const hasColor = true;
if (hasColor) {
  console.log("Ready to paint");
} else {
  console.log("Choose a color first");
}`
	}
};
