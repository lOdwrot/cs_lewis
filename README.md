# Świat C.S. Lewisa — Interaktywna Platforma Edukacyjna

An interactive learning platform exploring C.S. Lewis's intellectual journey through three thematic portals: **Wyobraźnia** (Imagination), **Rozum** (Reason), and **Wiara** (Faith). Learners progress through curated journeys made up of text/video lessons, audio essays, and knowledge-check quizzes — all with localStorage-persisted progress.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Framer Motion, Zustand, SCSS Modules, Tailwind CSS v4 |
| Backend / CMS | Strapi v5 (TypeScript), SQLite |
| API | Strapi REST (public read-only, no auth required for consumers) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20

### Install

```bash
npm install          # installs root + backend + frontend via postinstall
```

### Development

```bash
npm run dev          # starts Strapi on :1337 and Vite on :5173 concurrently
```

On first boot Strapi auto-seeds three gates, three journeys, nine steps, and five books. No manual admin setup is needed.

The Strapi admin panel is available at `http://localhost:1337/admin`. Create your admin account on the first visit.

---

## Content Architecture

```
Gate  →(M:M)→  Journey  →(M:M)→  Step
```

- **Gate** — top-level thematic portal (e.g. *Wyobraźnia*, *Rozum*, *Wiara*)
- **Journey** — a named, ordered collection of steps inside a gate
- **Step** — atomic content unit; its `type` field (`text` | `podcast` | `quiz`) determines which renderer is used

Relations are many-to-many, so a journey can appear under multiple gates and a step can appear in multiple journeys.

---

## Managing Content in Strapi

Open the admin panel at `http://localhost:1337/admin`.

### Adding or editing a Step

1. Go to **Content Manager → Step**.
2. Click **Create new entry** (or open an existing one).
3. Fill in:
   - **Title** and **Description** — shown in the journey timeline
   - **Type** — `text`, `podcast`, or `quiz` (controls the renderer)
   - **Estimated Time** — displayed as a reading/listening estimate
   - **Tags** — comma-separated strings for filtering
4. In the **Content** dynamic zone, add the matching component:

   | Step type | Component to add | Key fields |
   |-----------|-----------------|------------|
   | `text` | `step.text-content` | `markdown` (full Markdown body), `videoUrl` (optional YouTube embed) |
   | `podcast` | `step.podcast-content` | `audioUrl` (MP3), `transcript` (Markdown) |
   | `quiz` | `step.quiz-content` | `questions` (JSON array — see format below) |

5. **Publish** the entry — drafts are not exposed to the frontend.

#### Quiz `questions` JSON format

```json
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1,
    "explanation": "Shown after the user answers."
  }
]
```

### Adding or editing a Journey

1. Go to **Content Manager → Journey**.
2. Fill in **Title**, **Slug** (URL-safe, unique), **Description**, and **Difficulty** (`easy` | `medium` | `hard`).
3. In the **Steps** relation field, add steps in the desired display order.
4. Publish the entry.

### Adding or editing a Gate

1. Go to **Content Manager → Gate**.
2. Fill in **Title**, **Slug**, **Description**, **Enter Button Label**, **Icon Character** (emoji), and **Order** (ascending sort on the homepage).
3. In the **Journeys** relation field, attach one or more journeys.
4. Publish the entry.

### Adding or editing a Book

1. Go to **Content Manager → Book**.
2. Fill in **Title**, **Description**, and **Redirect URL** (e.g. an Amazon or Goodreads link).
3. Publish the entry.

### Permissions

Public read permissions (`find` / `findOne`) for all content types are set automatically by the bootstrap hook on every Strapi start. You do not need to configure them manually.

---

## Building

```bash
# Build everything from the repo root
npm run build

# Build individually
npm run build:backend    # Strapi admin panel
npm run build:frontend   # Vite → dist/
```

The frontend build output lands in `frontend/dist/`. The backend build output lands in `backend/dist/`.

---

## Environment Variables

Create a `.env` file at the repo root (copied from the example below). Both sub-packages read variables via `dotenv-cli`.

```env
# Backend
DATABASE_CLIENT=sqlite           # default; change to postgres/mysql for production
DATABASE_FILENAME=.tmp/data.db

APP_KEYS=key1,key2,key3,key4    # random strings, required by Strapi
API_TOKEN_SALT=random_string
ADMIN_JWT_SECRET=random_string
TRANSFER_TOKEN_SALT=random_string
JWT_SECRET=random_string

# Frontend — override the Strapi base URL seen by the browser
VITE_STRAPI_URL=http://localhost:1337

# CORS — add your frontend's public URL so Strapi allows it
CLIENT_URL=https://your-frontend-domain.com
```

Generate secure random values with `openssl rand -base64 32`.

---

## Deployment

The frontend is a static SPA; the backend is a Node.js process. They can be hosted independently.

### Frontend (static)

```bash
npm run build:frontend
# Serve frontend/dist/ from any static host
```

| Platform | Steps |
|----------|-------|
| **Netlify / Vercel** | Point root to `frontend/`, set build command `npm run build`, publish dir `dist`. Add `VITE_STRAPI_URL` env var. |
| **Nginx** | Copy `frontend/dist/` to your web root. Add a catch-all `try_files $uri /index.html;` rule for client-side routing. |
| **Docker** | Use `nginx:alpine`, copy `frontend/dist/` to `/usr/share/nginx/html`, add the try-files rewrite. |

### Backend (Node.js)

```bash
npm run build:backend
npm run start:backend   # production start (no file watching)
```

| Platform | Notes |
|----------|-------|
| **Railway / Render / Fly.io** | Set all env vars in the platform dashboard. Point start command to `npm run start --prefix backend`. Persist the SQLite file on a volume, or switch to PostgreSQL for production. |
| **VPS / bare metal** | Use PM2 or systemd to keep the process alive. Run behind Nginx as a reverse proxy on port 1337. |
| **Docker** | Build from `backend/`, expose port 1337, mount a volume at `/app/.tmp` to persist the SQLite database. |

### Switching from SQLite to PostgreSQL (recommended for production)

1. Install the Postgres provider: `npm install --prefix backend @strapi/database pg`.
2. Update `.env`:
   ```env
   DATABASE_CLIENT=postgres
   DATABASE_HOST=your-db-host
   DATABASE_PORT=5432
   DATABASE_NAME=cs_lewis
   DATABASE_USERNAME=strapi
   DATABASE_PASSWORD=secret
   ```
3. The database schema and seed data are applied automatically on first start.

---

## Project Structure

```
cs_lewis/
├── backend/               # Strapi v5 CMS
│   ├── src/
│   │   ├── api/           # gate, journey, step, book content types
│   │   ├── components/    # dynamic zone components (text, podcast, quiz)
│   │   └── index.ts       # bootstrap: permissions + seed data
│   └── config/
│       └── middlewares.ts # CORS origins (add CLIENT_URL for production)
├── frontend/              # React + Vite SPA
│   └── src/
│       ├── features/      # gates/, journeys/, steps/, books/
│       ├── components/    # shared UI (layout, animations)
│       ├── services/      # typed fetch functions (axios)
│       ├── store/         # Zustand progress store (localStorage)
│       └── types/         # Strapi v5 response TypeScript interfaces
├── package.json           # root scripts (dev, build, start)
└── .env                   # environment variables (not committed)
```
