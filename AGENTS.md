# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Static **Astro 5** site for the *Championnat du Monde de Lancer d'Avions en Papier* (Mérignac). It replaces a WordPress/Elementor site — preserving the old URLs — and is edited through a git-based **Sveltia CMS** and deployed on **Cloudflare Workers** static assets. All user-facing content is **French only**.

## Commands

```bash
npm run dev          # local dev server (astro dev)
npm run build        # production build → dist/
npm run verify       # astro check + astro build + check:links — the full gate
npm run check:links  # validate internal links in dist/ against files + _redirects (needs a build first)
npx vitest run       # run unit tests (src/lib/*.test.ts) — no npm script wraps this
npx vitest run src/lib/schema.test.ts   # single test file
```

`npm run verify` is the canonical pre-commit / pre-PR check. Cloudflare's build step must be set to `npm run build` (not the default), since the platform doesn't infer it.

Node ≥ 22.12 is required.

## Architecture

**Content is data, validated by Zod.** Everything editable lives under `src/content/` as Markdown or JSON and is defined + schema-validated in `src/content.config.ts` (8 collections: `reglages`, `tutoriels`, `actualites`, `editions`, `sponsors`, `faq`, `records`, `pages`). A bad field fails the build. When adding a content field, update the schema there first — pages read typed `getCollection()` results. `reglages` is a single JSON file holding site-wide event settings (date, venue, prices, contact) that many pages pull from; treat it as the source of truth rather than hardcoding those values.

**URL preservation is a hard constraint.** Routes in `src/pages/` deliberately mirror the old WordPress slugs. Tutorials are the notable case: each renders at a *flat top-level slug* (e.g. `/plier-avion-en-papier-nakamura/`) via `src/pages/[tutoriel]/index.astro`, which emits one page per non-`draft` tutorial. Anything the old site had at a URL we no longer serve goes in `public/_redirects` (`FROM  TO  301`), served by Cloudflare and validated by `check:links`. Config enforces `trailingSlash: 'always'` and directory-format output — keep internal links trailing-slashed.

**SEO / structured data.** Pure JSON-LD builder functions live in `src/lib/schema.ts` (no Astro imports, so vitest can test them directly — that's why they're separated). The `src/components/seo/*Schema.astro` components wrap those builders. Types emitted: Event, HowTo, FAQPage, Organization, BreadcrumbList.

**Layers.** `src/layouts/` (Base/Page/Article/Tutorial) → `src/components/` split into `seo/`, `layout/` (header/footer/nav), `ui/` (visual kit). Images go through `astro:assets` from `src/assets/` (schemas use `image()`); `src/lib/nav.ts` and `seo.ts` hold navigation and SEO helpers. Styling is Tailwind CSS v4 (via `@tailwindcss/vite`) plus `src/styles/global.css`; the display font is self-hosted Fira Sans (`@fontsource`).

**CMS + auth.** Sveltia CMS is configured in `public/admin/` (`config.yml`) and served at `/admin/`. It's git-based: each save is a commit that triggers a Cloudflare build. GitHub OAuth for the CMS is handled by a separate Worker in `workers/sveltia-cms-auth/` (its own `wrangler.toml`), distinct from the site's `wrangler.jsonc`.

## Layout notes

- `_source/` — original WordPress exports, reference only, not built.
- `docs/` — `DEPLOYMENT.md` (Cloudflare + OAuth + DNS cutover) and `CONTENT-REVIEW.md` (content to proofread before go-live) are the operational references.
- `dist/` is build output; `check:links` reads it.

## Imported Claude Cowork project instructions
