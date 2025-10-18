# Repository Guidelines

## Project Structure & Module Organization
TypiVibe is an Astro 5 project. The main UI lives in `src/pages/index.astro`, while authentication and database helpers are under `src/lib/`. API routes (Better Auth handler and WPM score endpoint) sit in `src/pages/api/`. Shared styles belong in `src/styles/global.css`, and static assets go in `public/`. Docker tooling (`Dockerfile`, `docker-compose.yml`) and configuration (`astro.config.mjs`, `tsconfig.json`) stay in the repo root.

## Build, Test, and Development Commands
- `npm run dev` — launches the Astro dev server on port 4321; ensure MongoDB from Docker is running first.
- `npm run build` — creates the production bundle in `dist/` for deployment.
- `npm run preview` — serves the built assets locally to validate release artifacts.
- `docker-compose up -d` — starts MongoDB and Mongo Express; use `docker-compose down` to stop services and `docker-compose logs -f mongodb` to inspect database output.

## Coding Style & Naming Conventions
TypeScript runs in strict mode via `tsconfig.json`. Prefer `.astro` files for pages and layout shells, with companion `.ts` modules for business logic. Use PascalCase for Astro component filenames, camelCase for functions and variables, and kebab-case for routes. Tailwind utility classes should remain inline; extend shared styles through `src/styles/global.css`. Keep indentation at two spaces and add concise comments only when behaviour is non-obvious.

## Testing Guidelines
Automated tests are not yet configured; validate changes manually by exercising the typing flow, anonymous authentication, and score persistence. When introducing tests, colocate them under `src/__tests__/` and name specs `<feature>.test.ts`. Aim to cover scoring logic, API endpoints, and auth lifecycle as new suites are added.

## Commit & Pull Request Guidelines
Commits should be small, focused, and written in the imperative mood (e.g., `Add score caching`). Reference related issues with `#ID` in the body. Pull requests must describe intent, outline implementation details, list verification steps (dev server logs, Docker status), and include screenshots or recordings for UI updates. Confirm `npm run build` and docker services succeed before requesting review.

## Environment & Security Notes
Store secrets in `.env` and `.env.local`; never commit modified values. The default development setup expects the Docker compose ports declared in `docker-compose.yml`. Rotate `AUTH_SECRET` for any deploy beyond local, and update `PUBLIC_APP_URL` to reflect the target environment.
