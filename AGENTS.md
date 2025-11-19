# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` — Next.js App Router pages and layout.
- `src/app/components/` — Reusable React components (PascalCase files).
- `src/app/globals.css` — Global Tailwind styles and animations.
- `public/` — Static assets (e.g., `logo.color.svg`).
- `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` — Build/config.

Example:
```
src/
  app/
    components/
      ClickVolcanoEffect.tsx
      KnowledgeGraphBackground.tsx
    layout.tsx
    page.tsx
```

## Build, Test, and Development Commands
- `npm install` — Install dependencies.
- `npm run dev` — Start local dev server at `http://localhost:3000`.
- `npm run build` — Production build (fails on type/compile errors).
- `npm start` — Serve the production build.
- `npm run lint` — Lint with Next.js ESLint config.

Tip: run `npm run lint -- --fix` before pushing.

## Coding Style & Naming Conventions
- Language: TypeScript + React 19, Next.js 15 (App Router).
- Components: PascalCase file and export names (e.g., `ClickVolcanoEffect.tsx`).
- Variables/functions: `camelCase`; constants `UPPER_SNAKE_CASE` if shared globals.
- Indentation: 2 spaces; include semicolons; prefer arrow functions and FCs.
- Client components must start with `'use client';` (see existing files).
- Styling: Tailwind CSS utility-first; keep custom CSS in `globals.css`.

## Testing Guidelines
- No test runner is configured yet. If adding tests:
  - Unit: Jest + React Testing Library; files as `*.test.ts(x)` under `src/` (e.g., `src/app/components/__tests__/Component.test.tsx`).
  - E2E: Playwright; place in `e2e/`.
  - Aim for meaningful interaction coverage for canvas/animation components.
  - Add `"test"` npm script and document usage in README.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`). Scope components when helpful: `feat(components): ...`.
- Branches: `feat/<short-desc>`, `fix/<issue-id>`, `chore/<task>`.
- PRs must include:
  - Clear description, linked issues (e.g., `Closes #123`).
  - Before/after screenshots or short GIFs for UI changes.
  - Checklist: ran `npm run lint` and `npm run build`; no console errors in dev.

## Security & Configuration Tips
- Do not commit secrets; prefer environment variables if introduced later.
- Keep client-only secrets out of the repo; public assets belong in `public/`.
- Large media files: store externally or optimize before adding to `public/`.
