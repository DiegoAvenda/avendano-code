export default {
	id: 1,
	title: 'Run Your First Program',
	description: `A program is a list of instructions. Press **Run** to execute the instructions, then look at the console: it is where a program can report what it did.`,
	task: `1. Press Run.\n2. Read the three messages in the console.\n3. Change the word inside the quotes and run again.`,
	concept: `**Running code and the console** — JavaScript executes from top to bottom, and \`console.log\` lets us inspect its output.`,
	whyItMatters: `Before changing a program, you need a reliable way to see what it did. The console is that first feedback loop.`,
	starterCode: {
		html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 1</title><link rel="stylesheet" href="style.css" /></head>
<body><h3>Your first program</h3><p>Open the console to see the program report its work.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 1: Run Your First Program
console.log("JavaScript is running");
const greeting = "Hello, pixel artist!";
console.log(greeting);
console.log("The program finished");`
	}
};
