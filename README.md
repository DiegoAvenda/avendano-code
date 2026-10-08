# Foundations & Diagram Lab

An interactive, browser-based course that teaches JavaScript, the DOM, Canvas and
classic data structures by building a **Pixel Art Editor** from scratch. The
application evolves with the knowledge: it starts as plain HTML, CSS and DOM, and
ends with typed memory, DFS/BFS, queues, ring buffers, modules, a build step and
TypeScript.

Learners read a short lesson, edit HTML/CSS/JavaScript in a CodeMirror editor, and
run the result inside a sandboxed preview with a captured console.

Routes: `/` is the home page (module list, progress and a "continue" shortcut) and
`/lesson/<id>` is the player. Lessons have their own URL, so they can be bookmarked
or shared, and the browser's back button works.

> Working on this repository with a coding agent? Start with [AGENTS.md](./AGENTS.md):
> it documents the curriculum invariants, the layout conventions and the traps that
> have already caused bugs.

The app hosts the curriculum in a single interactive project that shares the lesson
player, the playground and the progress store:

| Module                | Project          | Lessons | Topic                                                                                  |
| --------------------- | ---------------- | ------- | -------------------------------------------------------------------------------------- |
| Module 1 — JavaScript | Pixel Art Editor | 1–18    | DOM first, collapse at 16,384 elements, Canvas rescue, data structures, manual testing |

Each lesson is motivated by a problem the previous one left open.

The module closes its main arc with **one challenge lesson** (`type: 'challenge'`),
a boss fight that reuses 80% of the structure the learner just built and asks for 20%
of new reasoning: _The Border Inspector_ (16). Clearing the checks in the playground reveals a card with the
optional LeetCode equivalent (LC 463/733).

### Module 1 — JavaScript (1–18)

1. **Phase 1 (1–10) — Visual JavaScript with the DOM.** Variables, functions,
   conditionals, loops (256 divs), arrays for the palette, objects for the state,
   DOM `createElement`, pointer events, then the deliberate collapse: 16,384 divs
   (**The DOM Limit**) and the Canvas rescue that gets the frame rate back
   (**The Rescue**).
2. **Phase 2 (11–17) — Visual Data Structures and Algorithms.** Decide where
   a pixel lives (row-major indexing), store it in typed memory (`Uint8Array`),
   fill regions with DFS, hit the recursion limit, replace the call stack with a
   queue (BFS + head index), then apply it in the **challenge** _The Border
   Inspector_ (16: return the border of a region, not its interior) and bound
   undo/FPS history with a ring buffer.
3. **Phase 3 (18) — Closing.** Close the project with a **manual** Definition of
   Done: clean console, pure logic checked by hand, resource audit. No CI and no
   automated linting yet — this concludes the vanilla JS journey.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 runes (no backend)
- [CodeMirror 6](https://codemirror.net/) for the editor
- [Tailwind CSS](https://tailwindcss.com/) v4 for every piece of app styling
- Prettier + ESLint for formatting and linting
- Node's built-in test runner (`node --test`) for the test suite — no extra
  dependencies

## Getting started

```sh
pnpm install
pnpm dev          # start the dev server
pnpm dev --open   # …and open it in a browser
```

## Scripts

| Script         | What it does                                    |
| -------------- | ----------------------------------------------- |
| `pnpm dev`     | Development server with hot reload              |
| `pnpm build`   | Production build                                |
| `pnpm preview` | Serve the production build locally              |
| `pnpm test`    | Content + playground unit tests (`node --test`) |
| `pnpm lint`    | `prettier --check .` followed by `eslint .`     |
| `pnpm format`  | Rewrite files with Prettier                     |

`pnpm lint && pnpm test && pnpm build` is the full local gate and mirrors CI.

## Project structure

```
src/
  app.html                          # SvelteKit shell
  routes/
    +layout.js                      # ssr = false (client-only, localStorage)
    +layout.svelte                  # loads global CSS + favicon
    +page.svelte                    # home: module list, progress, continue CTA
    lesson/[id]/+page.js            # validates the lesson id (unknown → home)
    lesson/[id]/+page.svelte        # lesson player: header, progress, panels
    layout.css                      # Tailwind entry: @theme tokens + .md-* components
  lib/
    components/
      CodeEditor.svelte             # CodeMirror wrapper (one state per tab)
      Console.svelte                # captured console output
      LessonNavigation.svelte       # previous / next / counter
      LessonPanel.svelte            # lesson prose
      Playground.svelte             # editor + preview + console, saving
      Preview.svelte                # sandboxed iframe host
    content/pixel-editor/
      lessons.js                    # module + phase tables, metadata index, loaders
      curriculum/lesson-01.js…18.js # prose + starter code, one chunk per lesson
    playground/
      buildSrcDoc.js                # builds the iframe document
      iframeProtocol.js             # postMessage parsing
    stores/
      progress.svelte.js            # localStorage progress (+ migrations)
    markdown.js                     # dependency-free markdown renderer
tests/                              # node:test suites
```

## Styling

All app styling is Tailwind, themed as a cyberpunk terminal. `src/routes/layout.css`
is the single entry point:

```css
@import 'tailwindcss';
@import '@fontsource/share-tech-mono/400.css';

@theme {
	--color-cyber-yellow: #fcee0a;
	--color-cyber-cyan: #00f0ff;
	--color-cyber-magenta: #ff003c;
	--color-cyber-bg: #050505;
	--color-cyber-surface: #121212;
	/* …plus the semantic tokens (bg, surface-1..3, line, ink, muted, accent)
	   and neon shadows (shadow-neon-cyan / magenta / yellow) */
}
```

Each token becomes utilities (`bg-cyber-surface`, `text-cyber-cyan`, `border-line`,
…), so components carry utility classes in their markup instead of `<style>` blocks.
The only CSS left outside Tailwind is the `@layer components` block, which holds the
guide's clip-path/overlay/animation classes (`.clip-card`, `.clip-button`,
`.clip-image`, `.scanline-bg`, `.glitch`) and the `.md-*` classes emitted by the
markdown renderer. The lesson starter CSS stays plain as well.

> The starter CSS inside `curriculum/lesson-NN.js` is **course material**: it is
> what learners read and edit, so it stays plain CSS on purpose.

## Authoring lessons

Each lesson is a module under `src/lib/content/pixel-editor/curriculum/`:

```js
// curriculum/lesson-13.js
export default {
	id: 13,
	title: 'Fill the Area',
	description: '…markdown…',
	task: '1. …\n2. …',
	concept: '…markdown…',
	whyItMatters: '…markdown…',
	starterCode: { html: '…', css: '…', javascript: '…' }
};
```

`lessons.js` holds the module table (`modules`), the phase table (`phases`), the
lightweight index (`lessonList`, id + title only) and the `loaders` map that
imports each lesson chunk on demand. To add a lesson: create the module file, add
its `{ id, title }` entry to `lessonList`, add the loader, and extend `phases` —
plus `modules` when a new project starts.

Lessons 1–10 introduce the language, 11–17 build the pixel editor (challenge
included), and 18 closes the project with a definition of done.

Supported markdown: paragraphs, `##`/`###` headings, fenced code blocks, ordered
and unordered lists (one level of nesting), tables, `**bold**`, `*italic*`,
backtick code spans and links. Everything is HTML-escaped before rendering, so
lesson text can never inject markup.

After editing lessons, run `pnpm test`. The suite enforces the curriculum's
invariants:

- the shipped index carries metadata only (no prose or starter code);
- `modules` partition the curriculum without gaps or overlaps, and every lesson
  belongs to exactly one module and one phase;
- lesson ids are unique, sequential and start at 1;
- every lesson ships non-empty prose and non-empty starter code for all three tabs;
- every starter script parses as JavaScript;
- every `getElementById()` used by a lesson exists in that lesson's HTML;
- every CSS class used by a lesson is defined in that lesson's CSS;
- the `<title>` and the header comment carry the lesson id and its module's project
  name.

Add new lessons by updating `lessonList`, `loaders`, `phases` and — when a new
project starts — `modules`, then run the tests.

## How the playground works

`buildSrcDoc.js` assembles a single HTML document for the preview:

- it injects a small bridge script that forwards `console.log/warn/error`,
  `window.onerror` and `unhandledrejection` to the parent via `postMessage`;
- it inlines the learner's CSS and JavaScript (removing `<link rel="stylesheet">`
  and `<script src>`) so the preview works without extra requests;
- it escapes `</script>` / `</style>` sequences inside learner code so they cannot
  terminate the injected tags early.

The iframe runs with `sandbox="allow-scripts"` and no `allow-same-origin`, so
learner code is isolated from the app. `Preview.svelte` only accepts messages whose
`event.source` is its own iframe.

## Persistence

Progress (current lesson, completed lessons and per-lesson editor contents) is kept
in `localStorage` under `frontend-data-structures-progress` with a version field.
`progress.svelte.js` migrates the legacy unversioned payload and preserves data it
cannot interpret instead of discarding it.

The page runs with `export const ssr = false` (see `src/routes/+page.svelte`).
Because progress is read from `localStorage`, server rendering would emit HTML that
never matches a returning user's state; the app is a client-only interactive tool,
so it is rendered in the browser.

## Deployment

The project uses `@sveltejs/adapter-auto`. Deploying to a platform it does not
recognise (or any static host) requires installing the matching adapter — for a
fully static deployment, `@sveltejs/adapter-static` — as described in the
[SvelteKit adapter docs](https://svelte.dev/docs/kit/adapters).
