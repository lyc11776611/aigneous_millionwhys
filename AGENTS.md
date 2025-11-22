# Repository Guidelines

## Project Structure & Module Organization
Application code lives in `src/`. App Router pages, layouts, and loaders live under `src/app/`, while shared UI sits in `src/app/components/` (one PascalCase export per file). Keep animations and tokens in `src/app/globals.css`, and store docs or research assets inside `docs/`, `data/`, or `questions/`. Static media belongs in `public/`. Root-level configs such as `next.config.ts`, `tailwind.config.ts`, and `tsconfig.json` control builds—update them in tandem with framework upgrades.

## Build, Test, and Development Commands
- `npm install` — install or refresh dependencies.
- `npm run dev` — start the Next.js dev server at http://localhost:3000 with hot reload.
- `npm run lint` — run ESLint using the Next.js preset (add `-- --fix` to auto-format).
- `npm run build` — produce the production bundle; treat warnings as blockers.
- `npm start` — serve the compiled app for staging or smoke tests.

## Coding Style & Naming Conventions
Write TypeScript React function components using 2 spaces and semicolons. Prefer arrow functions (`const Hero = () => { ... };`), `camelCase` variables, and `UPPER_SNAKE_CASE` shared constants. React files and exports must use PascalCase (`ClickVolcanoEffect.tsx`). Client components require a leading `'use client';`. Favor Tailwind utility classes, adding custom rules to `globals.css` only when utilities cannot express the design. Run `npm run lint` before opening a PR.

## Testing Guidelines
A test runner is not shipped yet. When adding coverage, use Jest + React Testing Library with specs like `src/app/components/__tests__/ClickVolcanoEffect.test.tsx`, and document how to run them via an npm `test` script. Place any E2E checks in `e2e/` (Playwright recommended) so question flows, canvas effects, and data visualizations have regression protection.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat(components): add ClickVolcanoEffect shimmer`). Keep branches scoped as `feat/<summary>`, `fix/<issue>`, or `chore/<task>`. Pull requests must link issues (e.g., `Closes #42`), describe behavior changes, attach UI screenshots or GIFs, and confirm both `npm run lint` and `npm run build` pass. Call out any manual QA or data updates in the PR body.

## Security & Configuration Tips
Never commit secrets or API tokens; load them from `.env.local`, which is Git-ignored. Optimize heavy assets before adding them to `public/`, and avoid embedding client-only secrets in React components. When dependencies change, review Docker-related files to keep deployed environments aligned with local settings.
