# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` contains the Vite + React + TypeScript app; main code is in `frontend/src/` (`pages/`, `components/`, `services/`, `store/`, `hooks/`, `utils/`).
- `backend/` contains the Node/Express API; feature modules live under `backend/src/features/` (auth, cycle-tracking, user-profile, locations).
- Shared backend infrastructure is under `backend/src/shared/` (config, middleware, services, db utilities, cron jobs).
- Static assets and SEO files live in `frontend/public/`. Deployment config is in `render.yaml`.

## Build, Test, and Development Commands
- Frontend (run in `frontend/`):
  - `npm run dev` - start local Vite dev server.
  - `npm run build` - TypeScript check + production bundle.
  - `npm run lint` / `npm run format:check` - enforce ESLint and Prettier.
- Backend (run in `backend/`):
  - `npm run dev` - starts nodemon server (`predev` frees the port first).
  - `npm start` - run API in non-watch mode.
  - `npm test` - run Jest with coverage output.
  - `npm run lint` / `npm run format:check` - lint and formatting checks.

## Coding Style & Naming Conventions
- Use 2-space indentation and keep semicolon/style choices aligned with existing ESLint + Prettier configs.
- React components: `PascalCase` file names (e.g., `PageMeta.tsx`); hooks: `useX.ts`; stores/services/utilities: descriptive camelCase exports.
- Backend feature files use `feature.type.js` patterns (e.g., `cycle.controller.js`, `auth.validation.js`).
- Run format/lint before opening a PR.

## Testing Guidelines
- Backend uses Jest (`backend/jest.config.js`) with Supertest for API-level coverage.
- Place tests next to related modules or in dedicated `__tests__/` folders using `*.test.js` naming.
- Focus tests on controllers/services and validation logic; include error-path assertions.
- Run `npm test` in `backend/` before merging.

## Commit & Pull Request Guidelines
- Current history favors short, imperative summaries (e.g., `Fix Google OAuth crash when credentials not configured`).
- Prefer: `<scope>: <what changed>` with clear intent, typo-free, and one concern per commit.
- PRs should include: concise description, impacted areas (`frontend`, `backend`, or both), test/lint results, and screenshots for UI changes.
- Link related issues/spec docs when applicable (for example `EDIT_DELETE_IMPLEMENTATION_SPEC.md`).

## Security & Configuration Tips
- Never commit secrets; copy `backend/.env.example` to local `.env` and fill values privately.
- Validate OAuth/session/database settings locally before deploying.
