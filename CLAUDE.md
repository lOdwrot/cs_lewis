# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development (run from repo root)
```bash
npm run dev            # start both Strapi (:1337) and Vite (:5173) concurrently
npm run dev:frontend   # Vite only
npm run dev:backend    # Strapi only
```

### Frontend (run from `frontend/`)
```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint
npm run preview # serve the built output
```

### Backend (run from `backend/`)
```bash
npm run develop   # Strapi in watch mode (same as dev:backend above)
npm run build     # build Strapi admin panel
npm run start     # production start (no watch)
```

**First boot:** Strapi will auto-seed data and set public API permissions via the `bootstrap()` hook in `backend/src/index.ts`. No manual admin steps needed.

## Architecture

### Data hierarchy
```
Gate  →(M:M)→  Journey  →(M:M)→  Step
```
- **Gate** — top-level thematic portal (Imagination / Reason / Faith)
- **Journey** — a named collection of steps within a gate
- **Step** — atomic content unit; `type` enum determines the renderer (`text` | `podcast` | `quiz`)

Relations are many-to-many in both directions so a journey can appear under multiple gates and a step can appear in multiple journeys.

### Frontend (`frontend/src/`)

**Feature-based structure.** Each top-level concept lives in `src/features/`:
- `gates/` — `GatesPage` (portal grid), `GateDetail` (journey list)
- `journeys/` — `JourneyDetail` (step timeline)
- `steps/` — `StepRouter` dispatches to `TextVideoStep/`, `PodcastStep/`, `QuizStep/`
- `books/` — `BooksPage`

**Shared infrastructure:**
- `components/animations/` — `PageTransition` (AnimatePresence wrapper), `StaggerList`/`StaggerItem`, `FadeInView` (viewport-triggered)
- `components/layout/Header.tsx` — sticky header, two nav links only
- `services/*.service.ts` — typed fetch functions using the axios instance in `services/api.ts`; `VITE_STRAPI_URL` env var overrides the default `http://localhost:1337`
- `store/progressStore.ts` — single Zustand store persisted to localStorage key `cs-lewis-progress`; tracks `completedSteps`, `quizProgress` (per-question answers + score), and `podcastProgress` (playback seconds)
- `types/strapi.ts` — TypeScript interfaces matching Strapi v5 response shapes; step `content` is a discriminated union on `__component`
- `hooks/useFetch.ts` — minimal data-fetching hook (loading/error/data/refetch)

**Styling:** SCSS modules per component + global tokens in `src/styles/_variables.scss` (gold `#D4AF37`, fonts). Tailwind CSS v4 (via `@tailwindcss/vite`) is available for utilities. Path alias `@/` resolves to `src/`.

**Animations:** Framer Motion throughout. Page transitions use `AnimatePresence mode="wait"` in `App.tsx`. Individual elements use `whileHover`, `whileTap`, `whileInView`, and `animate` props rather than CSS-only transitions for anything interactive.

### Backend (`backend/`)

Strapi v5 with SQLite (`.tmp/data.db`). All content types are TypeScript and use the factory pattern:

```ts
export default factories.createCoreController('api::gate.gate')
```

**Content type schemas** live in `src/api/<name>/content-types/<name>/schema.json`.

**Dynamic zone components** for Step are in `src/components/step/` (`text-content.json`, `podcast-content.json`, `quiz-content.json`). Quiz questions are stored as a `json` field — an array of `{ question, options[], correctIndex, explanation }` objects.

**`src/index.ts` bootstrap** runs on every Strapi start and:
1. Sets `find`/`findOne` public permissions for all four content types (idempotent)
2. Seeds initial gates/journeys/steps/books if no gates exist yet

**CORS** is configured in `config/middlewares.ts` to allow `localhost:5173` and `localhost:3000`.

### Step content rendering

`StepRouter` fetches the step by `documentId` (URL param `:id`) and delegates to the matching component. Each renderer extracts its component by `__component` discriminant from `step.content[]`:
- `step.text-content` → markdown + optional YouTube embed
- `step.podcast-content` → `AudioPlayer` with 5-second throttled progress save
- `step.quiz-content` → per-question flow with answer reveal, localStorage resume, and `QuizComplete` screen

All step completion state is written to the Zustand store (`markStepComplete`, `markQuizComplete`) which persists immediately to localStorage.
