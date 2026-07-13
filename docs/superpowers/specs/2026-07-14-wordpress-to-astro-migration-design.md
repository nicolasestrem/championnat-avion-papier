# WordPress → Astro migration — championnatavionpapier.fr

**Status:** Approved design (2026-07-14). Next step: implementation plan.

## Context

The official site of the Championnat du Monde de lancer d'avions en papier (Mérignac, next edition **Sat 13 June 2026**, benefiting **Pompiers Solidaires**) runs on WordPress 7 + Elementor. The owner wants to **ditch WordPress entirely**: it's heavy, hard to maintain, and the site is too thin on content to perform in search. Source materials already in this repo: a cleaned content export (`championnatavionpapier-content-export.md`), the WXR export (`lesiteduchampionnat…2026-07-13.xml`, 444 items — ignore `uploads/wxr.xml`, it's stale template cruft), the full `uploads/` media dir, and 3 months of Search Console data (`championnatavionpapier.fr-Performance-on-Search-2026-07-14/`).

**Decisions validated with the user (section-by-section approval):**
- Stack: **Astro (fully static) + Sveltia CMS (git-based, `/admin`) + Cloudflare Workers static hosting** — approach A over Keystatic (B) and hosted CMS (C).
- Non-technical editors supported via Sveltia (French UI, GitHub login, saves = commits → auto-deploy).
- **Full SEO content expansion** (new tutorials, records, printables, editions, press, sponsors pages).
- **Fresh redesign**, mobile-first (70% of traffic is mobile), French only (architecture leaves room for EN later).
- Cloudflare Web Analytics (cookieless); no form backend needed (site has none — mailto + HelloAsso only).

## Evidence highlights (from exploration)

- **Search Console (3 mo):** 615 clicks / 26k impressions. Tutorial queries are the growth engine; the **#1 traffic page is a ~120-word Instagram-repurpose post** (`/tuto-avion-en-papier-facile-planeur/`, 20,241 impressions, 0.91% CTR, pos 6.7). Proven content gaps: "avion en papier rond/circulaire", "record du monde avion en papier (2023–2026)", "avion en papier à imprimer/gabarit", "lanceur d'avion en papier".
- **Content:** 8 pages + 7 posts + **1 revivable draft (Intercepteur tutorial, complete with Rank Math SEO)**. Strong: Nakamura (~1400w), Flèche Classique (~1300w), STEM history (~900w). Thin: FAQ (~200w), planeur (~120w), faucon (~100w). Empty Elementor shells: `/ressources-avions-papier/`, `/blog/`. Verbatim duplicate "children activities" block on home + activités; 4 posts cannibalize "plier un avion".
- **SEO assets to carry:** polished Rank Math titles/descriptions (verbatim), redirect intelligence (`_wp_old_slug` + `rank_math_auto_redirect` + artifact slugs), an existing Event schema object.
- **Media:** 222 real originals (~185MB) incl. 4 videos (~56MB), 2 press-kit PDFs, `Paper-plane-kit.pdf`, **Frutiger .ttf fonts** (brand typeface = airport-signage heritage). The other 505 files are WP thumbnails — discard.
- **Data conflicts to fix during migration:** beneficiary Pompiers Solidaires (new) vs DFCI (old pages) → Pompiers Solidaires everywhere, DFCI kept only in historical edition records; times "11h–15h" vs "midi–15h" → sélections 11h–15h, finales 15h30; stale 2025 dates and HelloAsso `…-3eme-edition` URLs → clean 2026 URL (strip `_gl` tracking param).

---

## Design spec (all sections user-approved)

### 1. Information architecture & URLs

Principle: keep every URL with search equity; clean only artifacts; 301 everything else.

**Kept & enriched:** `/` (event landing), `/histoire-championnat-avion-papier/`, `/contact-faq/` (expand to 15–20 Q FAQ + FAQPage schema), `/ressources-avions-papier/` (becomes tutorials hub/pillar), `/blog/` (Actualités), `/politique-de-confidentialite/`.
**Cleaned:** `/activites/` (301 from `/contact-faq-2-2/`). `/privacy-policy/` (EN) → 301 to FR policy. Add `/mentions-legales/` (French legal requirement).
**New SEO pages:** `/records-avion-en-papier/`, `/avion-papier-a-imprimer/` (uses existing Paper-plane-kit.pdf), `/editions/2025/` (+ per-year pattern; results, records, photo gallery), `/presse/`, `/sponsors/` (13 partners).
**Tutorials:** existing URLs kept verbatim. Rewrite thin ones in the Nakamura format (steps+photos+HowTo+FAQ): planeur, faucon, `/plier-un-avion-en-papier-3/`. Revive Intercepteur draft. New: avion rond/circulaire; lanceur d'avion en papier. Consolidate `/plier-avion-papier-facile/` → 301 into Flèche Classique. `/tuto/` + `/tag/*` → 301 to hub.
**Nav:** Accueil · Le Championnat (Histoire/Activités/Éditions) · Tutoriels · Actualités · Contact-FAQ · CTA **S'inscrire** (HelloAsso). Footer: sponsors, Rotary, Pompiers Solidaires, presse, légal.

### 2. Content model & CMS

Astro content collections, all editable via Sveltia forms (French labels):
- `reglages` singleton — event date/time/venue, HelloAsso URL, contact email, socials → propagates site-wide (hero, FAQ, Event schema, footer).
- `tutoriels` — frontmatter: title, seoTitle, seoDescription, difficulty, flightType (distance/durée), time, featured image, steps[] (text+image), faq[], dates, tags → drives HowTo/FAQPage schema.
- `actualites` (blog), `editions` (year/venue/results/records/gallery), `sponsors` (name/logo/url/blurb), `faq` (q/a/category), `records` (category/holder/value/year).
- Core pages (home, histoire, activités) as structured editable files.

Editor flow: `/admin` → GitHub login → form edit with image upload → save = commit to main → Workers Builds rebuild → live in ~2 min. CMS media lands in repo, goes through `astro:assets`.

### 3. SEO / performance / infrastructure

- Rank Math titles/descriptions migrated verbatim; keywords kept as reference comments.
- Full **301 map** (artifact slugs, `_wp_old_slug`, Rank Math merges, `/tuto/`, `/tag/*`, EN privacy, consolidated posts) — via Workers static-assets `_redirects`.
- `@astrojs/sitemap`, robots.txt, canonicals, OG/Twitter cards, RSS for blog.
- JSON-LD components: **Event** (home+FAQ), **HowTo** (tutorials), **FAQPage**, **Organization**, **BreadcrumbList**.
- Perf: zero-JS-by-default, responsive AVIF/WebP via astro:assets, Frutiger subsetted → woff2 with `font-display: swap`; target Lighthouse ~100 mobile.
- Videos: championship film via YouTube embed (lite-youtube pattern), 10s teaser self-hosted; raw mp4s archived.
- Hosting: GitHub → Cloudflare Workers Builds → Workers static assets; one tiny Worker for Sveltia GitHub OAuth (`sveltia-cms-auth`); DNS cutover only after verified; WordPress left running until then.
- Cloudflare Web Analytics (cookieless, no consent banner).

### 4. Design direction

"Le ciel comme terrain de jeu": Frutiger (airport-signage heritage) as brand type; sky blues + paper white + safety-orange accent (pompiers nod), WCAG AA; dotted flight-trajectory dividers, paper-fold textures, existing logo/flyer for 2026 block; mobile-first hero with date + sticky S'inscrire CTA; card tutorial grid; masonry galleries; records table styled like a departures board; minimal JS, motion only as small delights. Detailed visual iteration during implementation (frontend-design/impeccable skill).

---

## Implementation outline

(Details go in the writing-plans phase — this is the shape.)

1. **Repo restructure** (feature branch): Astro project at root; move raw exports + Search Console CSVs to `_source/` (kept in the repo as reference, excluded from the build); curate `uploads/` → keep the 222 originals actually needed in `src/assets/` + `public/files/` (PDFs), discard 505 thumbnails and plugin junk.
2. **Scaffold**: Astro + `@astrojs/sitemap` + Tailwind CSS v4, content collections with zod schemas, base layouts, SEO/JSON-LD components, Frutiger subsetting.
3. **Migrate content**: pages + 7 posts + Intercepteur draft from the cleaned export; fix data conflicts; carry Rank Math meta verbatim; convert `[caption]` → `<figure>`.
4. **Write new content** (FR): expanded FAQ, records, imprimer, éditions 2025 (+2024/2023 summaries from history), presse, sponsors, rewritten planeur/faucon/classique tutorials, new rond + lanceur tutorials, mentions légales.
5. **CMS**: Sveltia config (French labels), deploy `sveltia-cms-auth` Worker, GitHub OAuth app, test editor round-trip.
6. **Redirects + schema + sitemap**: `_redirects` file with the full map.
7. **QA & deploy**: build, link check, schema validation, Lighthouse, redirect tests; deploy to workers.dev preview → user verifies → DNS cutover checklist.

## Verification

- `npm run build` + `astro check` clean; internal link checker over dist.
- Every old URL curl-tested → correct 301 target (scripted from the redirect map).
- JSON-LD validated (Google Rich Results test / schema.org validator) for Event, HowTo, FAQPage.
- Lighthouse mobile ≥ 95 (target 100) on home, one tutorial, FAQ.
- Browser pass (Playwright/Chrome) on all routes at mobile + desktop widths.
- CMS round-trip: edit a field in Sveltia → commit → rebuild → change visible.
- Post-cutover: submit sitemap in Search Console, monitor coverage + the `/tuto-avion-en-papier-facile-planeur/` rewrite's CTR.
