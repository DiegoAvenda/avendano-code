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

The app hosts two independent projects ("modules") that share the same lesson
player, the same playground and the same progress store:

| Module                                 | Project          | Lessons | Topic                                                                                                       |
| -------------------------------------- | ---------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| Módulo 0 — Foundations Lab             | Pixel Art Editor | 1–30    | DOM first, collapse at 16,384 elements, Canvas rescue, data structures, tooling, TypeScript, manual testing |
| Módulo 1 — Flowchart & Diagram Builder | Diagram Builder  | 31–39   | Modelling, lookup vs. spatial indexing, graphs, Vitest + ESLint, accessibility, memory                      |

Each lesson is motivated by a problem the previous one left open.

Every module closes its main arc with **one challenge lesson** (`type: 'challenge'`),
a boss fight that reuses 80% of the structure the learner just built and asks for 20%
of new reasoning: _El Inspector de Contornos_ (16) and _Radar de Selecciones por
Proximidad_ (34). Clearing the checks in the playground reveals a card with the
optional LeetCode equivalent (LC 463/733 and LC 973).

### Módulo 0 — Pixel Art Editor (1–30)

1. **Phase 0.1 (1–10) — JavaScript Visual con el DOM.** Variables, functions,
   conditionals, loops (256 divs), arrays for the palette, objects for the state,
   DOM `createElement`, pointer events, then the deliberate collapse: 16,384 divs
   (**El Límite del DOM**) and the Canvas rescue that gets the frame rate back
   (**El Rescate**).
2. **Phase 0.2 (11–17) — Estructuras de Datos y Algoritmos Visuales.** Decide where
   a pixel lives (row-major indexing), store it in typed memory (`Uint8Array`),
   fill regions with DFS, hit the recursion limit, replace the call stack with a
   queue (BFS + head index), then apply it in the **challenge** _El Inspector de
   Contornos_ (16: return the border of a region, not its interior) and bound
   undo/FPS history with a ring buffer.
3. **Phase 0.5 (18–21) — Tooling Bridge.** Split the code into ES modules, watch
   the browser's module waterfall in the Network tab, bundle the project with
   **esbuild** (ten lines in `build.mjs`), and only then meet Vite: dev server, HMR
   and production build.
4. **Phase 0.6 (22–26) — TypeScript Bridge.** Start from real runtime failures
   (`node.lable`, `"100"` where a number was expected, a missing property), try
   JSDoc and runtime guards, then add interfaces, unions, optional properties and
   generics.
5. **Phase 0.7 (27–28) — Testing Básico.** Write a minimal test harness by hand and
   use it on the code from earlier lessons; then test the hard parts — time,
   randomness and side effects — by injecting them.
6. **Phase 0.8 (29–30) — Lifetime & Closing.** Audit the resources the editor
   really allocates (debounced timers, listeners), assert with tests that cleanup
   returns the counts to zero, and close the project with a **manual** Definition of
   Done: clean console, pure logic checked by hand, resource audit. No CI and no
   automated linting yet — that is Módulo 1.

### Módulo 1 — Diagram Builder (31–39), one project

The second module is a different application on a different stack, and the point
where the course introduces professional local tooling: Vite + TypeScript + Canvas +
DOM, with **Vitest** for the invariant suite and **ESLint/Prettier** keeping the code
clean.

1. **Phase 1 (31–36) — Model, Access & Scale.** Model before rendering, lookup by
   id, hit-testing at scale and connectivity:
   1. **31 — Model Before Rendering.** Nodes, connections, selection, tool and canvas
      state; rendering as a read-only projection of the model.
   2. **32 — Finding Things.** `Array.find` vs. a `Map` index, measured.
   3. **33 — Too Many Nodes.** Hit-testing thousands of nodes: linear scan vs. a
      spatial hash grid.
   4. **34 — Radar de Selecciones por Proximidad (challenge).** The circular lasso:
      turn a radius into a range of cells, filter by euclidean distance and return
      the nodes nearest-first.
   5. **35 — Groups and Connections.** Union-find for connectivity, and its
      limitation: it merges but cannot split.
   6. **36 — Testing the Structures.** Invariant-based tests for the `Map` index,
      the spatial grid and union-find — run locally with Vitest.
2. **Phase 2 (37–38) — Accessibility & Memory.** A semantic DOM layer over the
   canvas (semantic HTML, keyboard navigation, focus management, `aria-live`), and
   deliberate listener leaks fixed with `AbortController`.
3. **Phase 3 (39) — Closing.** The same checklist as Lesson 30 with a higher bar:
   ESLint and Prettier green, the Vitest suite green, and the hit-testing benchmark
   measured and documented.

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
      curriculum/lesson-01.js…39.js # prose + starter code, one chunk per lesson
    playground/
      buildSrcDoc.js                # builds the iframe document
      iframeProtocol.js             # postMessage parsing
    stores/
      progress.svelte.js            # localStorage progress (+ migrations)
    markdown.js                     # dependency-free markdown renderer
tests/                              # node:test suites
```

## Styling

All app styling is Tailwind. `src/routes/layout.css` is the single entry point:

```css
@import 'tailwindcss';

@theme {
	--color-bg: #0f0f1e;
	--color-surface-1: #161628;
	/* …surface-2, surface-3, line, ink, muted, accent */
}
```

Each token becomes utilities (`bg-surface-1`, `text-muted`, `border-line`, …), so
components carry utility classes in their markup instead of `<style>` blocks. The
only CSS left outside Tailwind is the `@layer components` block that styles the
`.md-*` classes emitted by the markdown renderer, and the lesson starter CSS.

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
included), 18–21 cover modules and build tooling, 22–26 cover TypeScript, and 31–39
build the diagram editor. The bridge lessons still run inside the playground: they
simulate the tooling (or the type checker) with runnable JavaScript so the problem is
visible before the tool appears.

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
