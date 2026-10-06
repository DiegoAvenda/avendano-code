# AGENTS.md

Instructions for any coding agent working in this repository (Codex, DeepSeek-based
agents, or a human in a hurry). Sections 1–4 hold the rules that are cheapest to break
and most expensive to fix: read them before changing code.

---

## 1. Project

**Frontend Data Structures Lab** — a browser course that teaches JavaScript, the DOM,
Canvas and data structures by building real projects. No backend: everything runs in the
browser and progress is stored in `localStorage`.

The course is organised in **modules**, and each module is one project (currently the
Pixel Art Editor and the Diagram Builder). Each lesson has prose (markdown), a task, a
concept, a "why it matters" note and runnable HTML/CSS/JS starter code that the learner
edits in a CodeMirror editor and runs inside a sandboxed iframe with a captured console.

The authoritative list of modules, phases and lessons is `modules`, `phases` and
`lessonList` in `src/lib/content/pixel-editor/lessons.js`. Do not copy lesson counts or
ranges into other files.

**Stack:** SvelteKit + Svelte 5, Tailwind CSS v4, CodeMirror 6, Prettier + ESLint (flat
config), Node's built-in test runner, pnpm (lockfile committed), Node 22. Exact versions
live in `package.json`; read them there instead of assuming.

## 2. Hard rules

1. **Client-only, no network.** The app makes no network requests (including CDN assets
   and remote fonts). Do not add one without discussing it first. `ssr = false` is
   set in `src/routes/+layout.js`.
2. **Svelte 5 runes only:** `$state`, `$derived`, `$effect`, `$props`.
3. **App UI is Tailwind utilities only.** No `<style>` blocks in components. **Lesson
   starter code keeps its own plain CSS on purpose** (it is a teaching artifact): never
   convert it to Tailwind.
4. **Tests are the contract.** If a test fails, fix the code or the content. Change or
   delete a test only when the invariant itself is being deliberately changed, and say so.
5. **Renumbering, inserting or moving lessons requires a progress migration** and a
   `STORAGE_VERSION` bump (section 6). The current storage version is **4**.
6. **`lessonList` carries only `{ id, title }`.** Heavy lesson content stays in
   `curriculum/` so the shell does not ship the whole course.
7. **Do not add dependencies without discussing it.** The markdown renderer and the test
   setup are dependency-free on purpose.
8. **Language:** the user talks to you in Spanish, so answer in Spanish. Everything in the
   repository (UI text, comments, tests, README, lesson prose, module labels) is English.
9. **Context discipline.** Do not read the whole repository. Start from the file the task
   points to (section 8), and read only what the change needs. In particular, do not open
   all `curriculum/lesson-NN.js` files unless the task is about all of them.

## 3. Commands and definition of done

```sh
pnpm dev          # dev server
pnpm build        # production build
pnpm test         # node --test
pnpm lint         # prettier --check . && eslint .
pnpm format       # prettier --write .
```

**Sandbox fallback.** In restricted environments `pnpm <script>` can fail before running
anything, because pnpm verifies the dependency tree and tries to reinstall
(`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`). When that happens, call the vendored
binaries directly; they behave identically. There is no `npx` in some of these
environments, so use these paths:

```sh
node --test
node node_modules/eslint/bin/eslint.js .
node node_modules/prettier/bin/prettier.cjs --check .
node node_modules/vite/bin/vite.js build
node node_modules/vite/bin/vite.js dev --port 5207 --strictPort
```

A change is done when all of these hold:

1. `node --test` passes (curriculum invariants, markdown, playground bridge, progress
   migrations).
2. ESLint is clean.
3. Prettier is clean (run `--write` first; the project uses tabs, single quotes, no
   trailing commas, width 100). This also applies to `.md` files, including this one.
4. `vite build` is clean, with no Svelte warnings.
5. For UI changes, verify in a real browser at desktop (~1440×900) **and** narrow
   (~760 px) widths, checking the preview, the console and lesson navigation.
   Screenshots are the proof.

## 4. Traps that have already caused bugs

These are not hypothetical: each one shipped or nearly shipped.

1. **Lesson template literals.** In a lesson file the property must open with a plain
   backtick:

   ```js
   concept: `Use \`const\` for fixed values.`   // correct
   concept: \`Use \`const\` for fixed values.\` // breaks the module at import time
   ```

   Escaping the _opening_ delimiter silently produces an invalid module. The test suite
   catches it, but only if you run it.

2. **The playground bridge captures `window.parent` before lesson code runs.** A lesson
   may legitimately declare its own top-level `parent` (union-find does, Lesson 36). If
   the bridge read the global later, `postMessage` would throw inside a `try/catch` and
   the console would go silently empty.
3. **`Run` must produce a new document.** `Preview.svelte` appends a unique build comment
   to the srcdoc. Without it, pressing Run clears the console without re-executing
   anything.
4. **The preview must execute exactly once per load.** `Preview.svelte` skips the first
   `$effect` run, because `onMount` already built the initial document.
5. **Lesson state lives behind a keyed remount.** `{#key lesson.id}` around `Playground`
   is deliberate: it is what resets per-lesson state (code, history, console). Do not
   "optimise" it away without providing an equivalent.
6. **Debounced saves capture the lesson id.** The pending save is flushed on destroy. A
   save must never be attributed to whichever lesson is open when the timer fires.

## 5. Content model

`src/lib/content/pixel-editor/lessons.js` is the **single source of truth** for the
curriculum structure and exports:

- `modules`: the projects, each
  `{ id, label, short, project, stack, description, from, to }`
- `phases`: the labelled stretches inside a module, each `{ id, label, from, to }`.
  Module 0 numbers them `Phase 0.x`; Module 1 uses `Phase 1…3`.
- `lessonList`: metadata only, `{ id, title }` per lesson
- `loaders`: `{ id: () => import('./curriculum/lesson-NN.js') }`
- `loadLesson(id)` / `loadAllLessons()` / `getModule(id)` / `getPhaseLabel(id)`

### Invariants enforced by `tests/lessons.test.js`

1. Lesson ids are **unique, sequential and start at 1** (global, not per module).
2. `modules` partition the ids without gaps or overlaps; every lesson belongs to exactly
   one module and one phase, and no phase crosses a module boundary.
3. `lessonList` carries only `id` and `title`.
4. Every lesson declares non-empty `title`, `description`, `task`, `concept`,
   `whyItMatters` and non-empty `starterCode.{html,css,javascript}`.
5. Every starter script parses as JavaScript.
6. Every `getElementById("x")` used by a lesson exists in that lesson's HTML.
7. Every CSS class used by a lesson is defined in that lesson's CSS.
8. Each lesson's `<title>` and first comment are `"<module.project> — Lesson <id>"`
   (e.g. `Pixel Art Editor — Lesson 29`, `Diagram Builder — Lesson 36`).

### Adding a lesson

1. Create `curriculum/lesson-NN.js` with the shape below.
2. Add `{ id: NN, title: '…' }` to `lessonList`, in order.
3. Add `NN: () => import('./curriculum/lesson-NN.js')` to `loaders`.
4. Extend `phases` (and `modules` when a new project starts).
5. Run `node --test`. Adding lessons **in the middle** of the sequence also requires a
   progress migration (section 6).

```js
// Pixel Art Editor — Lesson 29: Memory I: Lifetime & Cleanup
export default {
	id: 28,
	title: 'Memory I: Lifetime & Cleanup',
	description: `…markdown…`,
	task: `1. …\n2. …`,
	concept: `…markdown…`,
	whyItMatters: `…markdown…`,
	starterCode: {
		html: `…`,
		css: `…`,
		javascript: `…`
	}
};
```

### Content rules

- **One problem per lesson**, motivated by the previous lesson's open question.
  Categories: fundamentals → build → measure → choose the structure → verify.
- Markdown subset supported by `src/lib/markdown.js`: paragraphs, `##`/`###` headings,
  fenced code blocks, ordered/unordered lists (one nesting level), tables, `**bold**`,
  `*italic*`, `` `code` `` and links. Everything is HTML-escaped, so the renderer output
  is safe to inject with `{@html}`.

### Challenge lessons (boss fights)

Every module closes its main arc with **one challenge lesson**, marked
`type: 'challenge'` in both `lessonList` and the lesson object. They follow an
80/20 rule: 80% of the task is the structure the learner just built (the buffer and
BFS in Lesson 16, the spatial grid in Lesson 34) and the remaining 20% is new
reasoning.

Conventions:

- the starter code ships the **function signature** to implement, the surrounding
  model, and a checker with fixed cases; the learner only writes the function body;
- the checker grades the result and, when every case passes, reveals a card
  (`#card`) that links the pattern to its optional LeetCode equivalent;
- the prose starts with **"Integrative challenge (boss fight)"**, which the test suite
  asserts, and the UI shows a `Integrative challenge` badge on the lesson plus a distinct
  progress dot.

`tests/lessons.test.js` enforces that each challenge is flagged in both places, that
its prose announces itself, and that every module has at least one.

## 6. Progress data

- Progress lives in `localStorage` under `frontend-data-structures-progress`, with a
  `version` field. `src/lib/stores/progressMigrations.js` holds the **pure** migration
  functions and `tests/progress.test.js` covers them.
- **If you renumber, insert or move lessons, add a migration and bump `STORAGE_VERSION`.**
  Never drop a payload you cannot interpret; keep what is readable. `completedLessons`,
  `currentLesson` and `editorContents` must all be migrated together.

## 7. Styling

- Design tokens live in `src/routes/layout.css` under `@theme` (`bg`, `surface-1..3`,
  `line`, `ink`, `muted`, `accent`) and become utilities (`bg-surface-1`, `text-muted`,
  `border-line`, …).
- Markdown-generated markup cannot carry utilities, so the renderer emits semantic `.md-*`
  classes styled once with `@apply` in `layout.css`. Keep that list in sync with
  `src/lib/markdown.js`.
- Layout notes: the mobile breakpoint is `max-[900px]`; the playground gives the editor
  `flex-[3]` and the preview `flex-[2]`; the console is 128 px tall and collapsible (its
  collapse button lives in the console header).

## 8. Repository map and where changes go

Import app code with the `#lib/...` subpath alias (`import { buildSrcDoc } from
'#lib/playground/buildSrcDoc.js'`). It is declared in `package.json` → `imports`; there
is no `svelte.config.js` and no `alias` option in the Vite config.

| Change                                   | File                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Palette / design tokens                  | `src/routes/layout.css` (`@theme`)                     |
| Lesson prose or starter code             | `src/lib/content/pixel-editor/curriculum/lesson-NN.js` |
| Curriculum order, module or phase labels | `src/lib/content/pixel-editor/lessons.js`              |
| Editor/preview/console layout            | `src/lib/components/Playground.svelte`                 |
| Editor wrapper (one state per tab)       | `src/lib/components/CodeEditor.svelte`                 |
| Preview iframe host                      | `src/lib/components/Preview.svelte`                    |
| Preview document or console bridge       | `src/lib/playground/buildSrcDoc.js`                    |
| iframe message parsing                   | `src/lib/playground/iframeProtocol.js`                 |
| Markdown rendering                       | `src/lib/markdown.js` + `.md-*` rules in `layout.css`  |
| Progress format or migrations            | `src/lib/stores/progress*.js` (+ tests)                |
| Home page / routes                       | `src/routes/+page.svelte`, `src/routes/lesson/[id]/`   |

Other files worth knowing: `src/routes/lesson/[id]/+page.js` validates the lesson id
(unknown ids go home), and `Console.svelte`, `LessonNavigation.svelte` and
`LessonPanel.svelte` live next to the components above. Tests are `node:test` suites in
`tests/`.

## 9. Maintaining this file

- Keep this file stable: rules, invariants and traps only. Do not record project status,
  lesson counts or "what we did last" here; they go stale and the code is the source of
  truth.
- When a new bug teaches a lesson the tests cannot catch, add it to section 4 with the
  reason. When it can be caught by a test, write the test instead and mention it here.
- Keep it under ~300 lines and well under 32 KiB (Codex truncates project instructions at
  its limit). Put the most important rules first.
