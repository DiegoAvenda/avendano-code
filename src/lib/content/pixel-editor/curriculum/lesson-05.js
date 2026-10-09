export default {
	id: 5,
	title: 'Give Code a Job',
	description: `A function is a named recipe. Instead of repeating the same calculation, we give it a name and call it whenever we need it.`,
	task: `1. Change the two numbers in the function call.\n2. Run the code.\n3. Add another call with different numbers.`,
	concept: `**Functions and return values** — a function accepts input, does one job, and can return a result.`,
	whyItMatters: `Functions keep each part of a growing editor focused and reusable.`,
	starterCode: {
		html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Pixel Art Editor — Lesson 5</title><link rel="stylesheet" href="style.css" /></head><body><p>Call the function and inspect its result in the console.</p><script src="script.js"></script></body></html>`,
		css: `body { background: #1a1a2e; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }`,
		javascript: `// Pixel Art Editor — Lesson 5: Give Code a Job
function getCellCount(width, height) {
  return width * height;
}
const total = getCellCount(8, 8);
console.log("Cells: " + total);
console.log(getCellCount(4, 4));`
	}
};
