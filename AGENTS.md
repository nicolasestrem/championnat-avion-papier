# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` — Route pages (e.g., `index.astro`, `contact.astro`, `blog/`).
- `src/components/` — Reusable UI (e.g., `Header.astro`, `Footer.astro`).
- `src/layouts/` — Shared layouts (e.g., `Layout.astro`, `BlogPost.astro`).
- `src/styles/` — Global styles (`global.css`, Tailwind v4).
- `src/content/` — Content collections (`config.ts`, `blog/*.md`).
- `public/` — Static assets (served as-is).
- `tests/e2e/` — Playwright specs.
- Build output: `dist/`. Config: `astro.config.mjs`, `lighthouserc.js`.

## Build, Test, and Development Commands
- `npm run dev` — Start Astro dev server at `http://localhost:4321`.
- `npm run build` — Production build to `dist/`.
- `npm run preview` — Serve the built site locally.
- `npm run test` — All checks (E2E + CSS lint).
- `npm run test:e2e` (`:ui`, `:headed`) — Playwright tests.
- `npm run lint:css` (`:fix`) — Stylelint over `src/**/*.css`.
- `npm run lighthouse` — Lighthouse CI; budgets enforced via `lighthouserc.js`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; keep files small and focused.
- Astro components: PascalCase (e.g., `Hero.astro`); pages: kebab-case in `src/pages/`.
- Content slugs: lowercase-kebab (e.g., `tuto-planeur.md`). Ensure required frontmatter per `src/content/config.ts`.
- Prefer Tailwind utilities; put global/custom CSS in `src/styles/global.css`.
- Linting: Stylelint is configured via `.stylelintrc.json`.
- Keep client JS minimal; use Astro’s zero-JS by default unless needed.

## Testing Guidelines
- Framework: Playwright (`tests/e2e/*.spec.ts`). Base URL `http://localhost:4321` via dev server.
- Write tests for new pages/flows; include accessibility checks when possible.
- Run locally: `npm run test:e2e` (or `--ui` for debug). Ensure cross-browser stability.

## Commit & Pull Request Guidelines
- Conventional Commits (e.g., `feat(homepage): add hero animation`, `fix(contact): validate form`).
- Open PRs with: clear description, linked issues, screenshots for UI changes, and local results (`npm run test`, `npm run lighthouse`).
- Keep PRs scoped; update docs/content and tests alongside code.

## Security & Configuration Tips
- Never commit secrets. Only variables prefixed with `PUBLIC_` are exposed to the client (e.g., `PUBLIC_FORMSPREE_ID`).
- Performance/accessibility budgets must pass CI; avoid heavy dependencies and large images.

## Agent-Specific Notes
- Add UI to `src/components/` or `src/pages/`; avoid creating new top-level folders.
- Reuse existing patterns and styles; do not introduce new linters/formatters without discussion.
- For blog posts, add Markdown to `src/content/blog/` matching the schema in `src/content/config.ts`.

