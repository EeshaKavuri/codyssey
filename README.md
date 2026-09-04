# Codyssey

> **Learn the pattern. Trace the state. Design the system.**

Codyssey is an interactive, self-paced interview-preparation studio for **Data Structures & Algorithms, High-Level Design, and Low-Level Design**. It turns passive notes into visual explanations, controllable algorithm traces, structured practice, and a canvas for thinking through problems.

## Why Codyssey?

Interview preparation should not feel like memorising disconnected solutions. Codyssey teaches from the bird's-eye view first, then gradually moves into implementation details, invariants, trade-offs, edge cases, and interview-ready reasoning.

### What is included

- **12-week self-paced curriculum** — complete a week whenever you are ready
- **455 DSA questions** grouped into **60 reusable patterns**
- **Interactive algorithm traces** with playback controls, Python line highlighting, variable state, narration, custom input, and prediction prompts
- **Pattern playbooks** covering recognition signals, invariants, implementation blueprints, complexity, adaptation questions, and common mistakes
- **Beginner-first HLD and LLD lessons** with mental models, trade-offs, misconceptions, interview prompts, and real-world context
- **Visual Problem Workspace** for modelling arrays, matrices, linked lists, stacks, queues, trees, heaps, tries, and graphs
- **Practice tracking** by Easy, Medium, and Hard difficulty
- **Local profiles and progress** with JSON export/import for backup or device migration
- **Appendix of learning resources** used across DSA, HLD, LLD, engineering blogs, simulators, and UX inspiration

## Visual Problem Workspace

Build the exact state described by a problem before writing code:

- Add, edit, move, highlight, and delete nodes or cells
- Connect `next`, `prev`, `left`, `right`, child, and graph edges
- Model shared linked-list tails and intersections
- Write invariants, pseudocode, and edge-case tests beside the diagram
- Undo changes, clear the canvas, or restore structure examples
- Keep each workspace automatically saved in the browser

## Learning flow

```text
Mental model
     ↓
Recognise the pattern
     ↓
Understand the invariant
     ↓
Trace the algorithm
     ↓
Adapt the blueprint
     ↓
Solve and review
```

## Tech stack

- React 19
- TypeScript
- Vite 6
- CSS animations and SVG visualisations
- Browser `localStorage`
- GitHub Actions and GitHub Pages

Codyssey is fully static. It does not require a database, authentication provider, or backend service.

## Production build

```powershell
npm run build
npm run preview
```

The production files are generated in `dist`.

## Deploy with GitHub Pages

The repository includes a GitHub Actions deployment workflow.

1. Push the project to a GitHub repository whose default branch is `main`.
2. Open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`.
5. The workflow builds the app and publishes `dist`.

Vite uses relative asset paths, so repository-level GitHub Pages URLs are supported.

## Progress and privacy

Codyssey is local-first:

- Your display name, selected week, completed modules, solved questions, active page, and visual workspaces remain in your browser.
- No account or server is required.
- Clearing browser site data removes local progress.
- Use **Profile → Export progress** to download a backup.
- Use **Import progress** to restore it in another browser or device.

## Project structure

```text
src/
├── components/dsa/        Interactive traces and visual workspace
├── data/                  DSA catalog, theory, curricula, and resources
├── App.tsx                Navigation, progress, lessons, and practice
└── styles.css             Responsive UI and animations

scripts/                   DSA sheet parsing and URL attachment tools
.github/workflows/         GitHub Pages deployment
```

## Content transparency

The course text is synthesised for Codyssey rather than copied from external resources. The in-app Appendix links to the original DSA sheets, system-design guides, reliability books, design-pattern references, engineering blogs, and visual-learning products that informed the curriculum.

---

**Codyssey** — because interview preparation is a journey, not a checklist.
