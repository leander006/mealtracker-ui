# Meal Tracker - Frontend

React + TypeScript + Vite frontend for the meal-tracker platform.

## Stack and why

- **Vite** over Create React App - CRA is effectively unmaintained; Vite is faster to build with and is the current standard choice for new React projects.
- **TypeScript** - types are hand-mirrored from the backend's Java DTOs (`src/types/`). This is a real, known limitation worth naming: they can drift if the backend changes without the frontend being updated. A larger project would generate these from an OpenAPI spec instead.
- **Tailwind CSS** - utility-first styling, no separate CSS-file-per-component sprawl.
- **React Router** - standard client-side routing; `ProtectedRoute` gates authenticated pages.
- **Axios** with a single central instance (`src/api/client.ts`) - all HTTP concerns (auth header injection, 401 handling, error message extraction) live in exactly one place.

## Architecture

```
src/
  api/          - typed functions for every backend endpoint, grouped by domain
  types/        - TypeScript interfaces mirroring backend DTOs
  context/      - AuthContext (session state)
  hooks/        - useAuth
  components/   - ProtectedRoute, Layout (shared across pages)
  pages/        - one file per route
```

Components never call `axios` or `fetch` directly - they call functions from `src/api/`, which return typed data. This keeps HTTP concerns out of UI code entirely.

## Known, deliberate tradeoffs (not oversights)

- **JWT stored in `localStorage`** (see comment in `AuthContext.tsx`) - simple and works, but vulnerable to theft via XSS if the app is ever compromised. A production app handling more sensitive data would use an httpOnly cookie set by the backend instead, which JS can never read. Documented here explicitly.
- **No pagination on meal history** - loads up to 90 days at once. Fine at current scale, would need real pagination before this became a problem with heavy usage.
- **No test suite yet** - forthcoming; a real production frontend would have component tests (React Testing Library) and at minimum smoke tests for the auth flow and scan flow before calling this "done."

## Local development

```bash
npm install
cp .env.example .env      # then edit VITE_API_BASE_URL if needed
npm run dev
```

Runs on `http://localhost:5173`, expects the Spring Boot backend at `http://localhost:8080` (adjust `VITE_API_BASE_URL` in `.env` if different).

## Building for production

```bash
npm run build
```

Outputs static files to `dist/`.

## Deployment

**Primary path: Vercel.** Connect the repo, set `VITE_API_BASE_URL` as an environment variable in Vercel's project settings pointing at the deployed Spring Boot URL. Vercel handles the Vite build automatically.

**Alternative path: Docker.** A `Dockerfile` is included (multi-stage: Node build -> nginx serving static output) for deploying to any container host instead of Vercel:

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-backend-url.onrender.com -t meal-tracker-frontend .
docker run -p 8080:80 meal-tracker-frontend
```

**Important:** `VITE_API_BASE_URL` is a *build-time* value, not a runtime one - Vite bakes it into the compiled JS bundle. This means switching backend URLs requires rebuilding the image, not just changing a running container's environment variables. Worth knowing before assuming you can swap environments by restarting the container.
