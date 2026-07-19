# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Tutoriel F-16** (`/plier-avion-en-papier-f16/`, 12 étapes, `draft: true`) — première
  réplique d'avion réel du site. Plié d'après les planches de **Kyong H Lee**
  ([amazingpaperairplanes.com](https://www.amazingpaperairplanes.com/), page `FoldingF16A.html`),
  **reproduites avec son autorisation** — l'accord est détenu par Nicolas Estrem, à verser au
  dossier avant publication. Le texte français est écrit pour ce site (pas une traduction) et les
  cotes impériales de la source sont converties en cm pour le A4.
  **Reste en `draft` jusqu'à un test de pliage réel** : les étapes 5 à 7 (pli renversé, pli pétale)
  sont déduites de schémas statiques et n'ont pas été vérifiées papier en main.
- **Tutoriel Aile Delta** (`/plier-avion-en-papier-aile-delta/`, 14 étapes, `draft: true`) —
  même source et même autorisation que le F-16 (page `fighter-delta2-folding.html`).
  Modèle le plus technique du site : trois plis renversés, ouverture de caisson d'aile,
  verrouillage mécanique du fuselage. **Reste en `draft` en attendant un test de pliage.**
  Schémas sources de 450–500 px seulement (contre 2475 px pour le F-16) — lisibles mais à
  remplacer si de meilleures planches deviennent disponibles.
- **`scripts/import-tutorial-images.mjs`** — conversion sharp des sources brutes
  (`src/assets/tutoriels/_incoming/<slug>/`) en AVIF committés (1200 px, qualité 72).
  Premier pipeline d'images réutilisable du dépôt ; `_incoming/` reste gitignoré.
- **Branded 404 page** (`src/pages/404.astro`, noindex) — required by
  `wrangler.jsonc` (`not_found_handling: "404-page"`), which expects `dist/404.html`.
- **Cutover redirect rules** in `public/_redirects`: legacy Rank Math / WP core XML
  sitemaps (`/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`, per-type children)
  → `/sitemap-index.xml`; WordPress feeds (`/feed/`, `/comments/feed/`, `/blog/feed/`)
  → `/rss.xml`; stripped category archives (`/general/`, `/histoire/`); date archives
  (`/2023/*`–`/2026/*`) → `/blog/`; `/author/*` → `/`.
- HowTo JSON-LD now carries the tutorial image (`schema.ts` + `TutorialLayout`), with
  real photos/fallback graphics wired for all tutorials and sponsor logo fields filled.
- ADHD-friendly cutover checklist (`docs/CUTOVER-ONE-PAGER.md`).
- Design spec + task-by-task implementation plan for the WordPress → Astro migration
  (`docs/superpowers/specs/` and `docs/superpowers/plans/`).
- **Full static Astro 5 site** replacing WordPress/Elementor: 26 pages, mobile-first,
  zero JS by default, Tailwind CSS v4, self-hosted Fira Sans.
- Content collections (Zod-validated Markdown/JSON) for reglages, tutoriels, actualités,
  éditions, sponsors, FAQ, records, and core pages.
- **SEO content expansion**: rewritten thin tutorials (planeur ~120→~1185 words, faucon,
  classique), revived Intercepteur tutorial, new tutorials (avion rond, lanceur),
  21-question FAQ, records/éditions/sponsors/presse/à-imprimer pages.
- JSON-LD structured data: Event, HowTo (×8 tutorials), FAQPage, Organization, BreadcrumbList.
- 301 redirect map preserving WordPress URLs (`public/_redirects`), sitemap, RSS, robots.
- Sveltia CMS config (`public/admin/`) + GitHub OAuth Worker (`workers/sveltia-cms-auth/`).
- Deployment + DNS-cutover guide (`docs/DEPLOYMENT.md`) and content-review checklist
  (`docs/CONTENT-REVIEW.md`).
- `CLAUDE.md` guide for future Claude Code sessions (commands, content-as-data architecture,
  URL-preservation constraint, JSON-LD layering, CMS/OAuth split).
- Claude Code automations: `redirect-guardian` subagent (`.claude/agents/`) that reviews
  content/route diffs for missing 301s, slug collisions, and dropped JSON-LD; and the user-only
  `new-tutorial` skill (`.claude/skills/`) that scaffolds schema-valid tutorial frontmatter and
  prompts for the matching `_redirects` line.

### Changed
- `TutorialLayout` now builds HowTo JSON-LD image URLs with the shared `absolute()`
  helper (`src/lib/seo.ts`) instead of a local duplicate.
- Raw image sources (`src/assets/**/_incoming/`, ~89 MB of Gemini outputs and sponsor
  originals never imported by any page) are untracked and gitignored; only the derived
  optimized assets stay in the repo.
- `docs/DEPLOYMENT.md` switch-day checklist now covers the zone-level steps that can't
  live in the repo: `www` → apex 301 Redirect Rule, disabling WordPress-era Cloudflare
  rules (APO/Page Rules/Cache Rules), keeping the `*.workers.dev` preview behind
  Cloudflare Access, LAN-only WordPress rollback (no public subdomain), and 4-week
  Search Console 404 monitoring; rollback section documents the ~1-minute
  remove-custom-domain path.
- Sveltia CMS auth is live: `sveltia-cms-auth` Worker deployed
  (`https://sveltia-cms-auth.nicolas-estrem.workers.dev`, GitHub OAuth App + secrets in
  place), `base_url` set in `public/admin/config.yml`. CMS still targets `main`, so no
  CMS saves until PR #1 merges; the image-upload round-trip is a post-merge checklist
  item in `docs/DEPLOYMENT.md`.
- Cloudflare Web Analytics wired for real: property created for `championnatavionpapier.fr`
  and the beacon token replaced in `src/layouts/BaseLayout.astro` (was
  `REPLACE_WITH_CF_ANALYTICS_TOKEN`).
- Font resolved to self-hosted Fira Sans after confirming Frutiger is not web-licensed.
- Tutorial featured images (first pass): wired real WordPress-sourced images for the planeur
  (folding diagram) and classique (model render) tutorials; the faucon, rond, lanceur, and
  intercepteur tutorials (no source photo exists) now use an on-brand generic paper-plane
  illustration (`src/assets/tutoriels/tutoriel-generique.avif`, generated by
  `scripts/make-tutorial-fallback.mjs`) instead of the corporate-logo placeholder.

### Added (galeries photos des éditions, 14/07/2026)
- Édition galleries populated from the WordPress `uploads/` archive: 11 photos for 2023
  (EXIF-dated 27/05/2023) and 5 for 2024 (EXIF-dated 01/06/2024), processed to 1600 px AVIF
  via sharp; `_censored` (face-blurred) variants preferred wherever they exist. Discarded:
  head-cropped framings and burst duplicates (documented in `src/assets/ASSET-MANIFEST.md`).
- New `/editions/2026/` page (`src/content/editions/2026.json`, minimal factual entry) with a
  7-photo gallery of the 13/06/2026 event, including the Pompiers Solidaires stand — the 3
  remaining WhatsApp photos converted as `edition-2026-05..07.avif`.
- Histoire timeline rows now link to each `/editions/<annee>/` page (2023–2026 were
  previously orphan pages) and the nav "Éditions" entry points to `/editions/2026/`.
- Homepage photo mosaic: new « Le Championnat en images » section between the editorial
  content and the partners block — a 5-photo mosaic (one 2×2 feature tile + four squares,
  new `src/components/ui/PhotoMosaic.astro`, zero JS) of curated édition shots (2023 atelier
  de pliage as feature; pliage sur gabarits 2025, Alphajet 2026, drapeaux des nations 2025,
  finales en gymnase 2026), each tile linking to its `/editions/<annee>/` page. Verified
  visually at 1280 px and 390 px via Playwright against the built site.

### Fixed (content fact-check pass, 14/07/2026)
- Flèche Classique tutorial: step images were scrambled (step 1 showed the nose fold,
  step 3 showed the wing fold…) — remapped after visual inspection of every diagram;
  step 6 gains its dihedral diagram, step 2 has no matching asset (documented).
- Intercepteur `typeVol` corrected `polyvalent` → `distance` (body, SEO description,
  FAQ and tags all say distance; also fixes the "À découvrir aussi" grouping).
- Édition 2025: beneficiary corrected to DFCI — the WordPress source and histoire.md
  both date the switch to Pompiers Solidaires in 2026 (flagged for user confirmation).
- Édition 2024: « venus de 14 nationalités » → « venus de 14 pays ».
- Flèche/Nakamura intros no longer claim every step is illustrated.
- Full findings report (fixes, pending decisions, clean areas) in
  `docs/CONTENT-REVIEW-FINDINGS.md`, linked from CONTENT-REVIEW.md.

### Fixed (PR review pass)
- Event JSON-LD price now derived from `reglages.tarifCompetiteur` instead of a hardcoded
  `'8'`, so structured data tracks the CMS.
- Contact/FAQ "Ajouter à Google Agenda" dates now derived from `reglages.dateISO` instead
  of hardcoded, so the calendar link follows any date change.
- `LiteYouTube` script no longer `is:inline` and guards against duplicate click listeners.
- `check-links.mjs` decodes percent-encoded paths on both sides to avoid false positives.
- OAuth Worker reflects the caller's origin for allowed/localhost/preview hosts, so CMS login
  also works on `localhost`, `*.workers.dev`, and preview deploys.
- Sveltia CMS collections with image fields now use entry-relative `media_folder`/`public_folder`
  (`../../assets/uploads`) so editor uploads write `image()`-resolvable paths (needs a live
  CMS round-trip to confirm — see `docs/CONTENT-REVIEW.md`).
- Reviewed and dismissed two false-positive bot findings: `astro@^7.0.9` is the current latest,
  and the `{"reglages": {…}}` nesting is the correct `file()`-loader singleton shape.

### Fixed (PR review pass 2, 14/07/2026)
- **OAuth worker security (P1)**: the callback popup accepted the first `postMessage` from any
  window and replied with the repo-scoped token to `e.origin`. The CMS origin is now captured
  from the Referer on `/auth`, persisted in an HttpOnly cookie next to the CSRF state,
  re-validated against the allowlist on `/callback` (the GitHub redirect carries no CMS
  Referer — this also fixes login from localhost/preview deploys, which previously fell back
  to the production origin), and the token is only ever posted to that validated origin; the
  callback page ignores messages from any other source/origin. Deployed 14/07/2026
  (`npx wrangler deploy`, version `04986378`); the CMS login smoke test still needs to be
  re-run against the new worker code.
- `/contact-faq-2/` now 301s to `/` instead of `/activites/`: per the WordPress export, page
  id 12 (internal slug `contact-faq-2`) was the *home* page; only `contact-faq-2-2` was the
  activities page.
- `/histoire-avions-papier/` (flat legacy route) now honors `draft: true` like the blog
  index, RSS and `/blog/[slug]/` — a draft emits a `noindex` meta-refresh redirect to
  `/blog/` (verified by building with the flag set, then reverted).
- Sveltia CMS "Pages" collection set to `create: false` / `delete: false`: every page route
  is a hard-coded `getEntry()`, so a CMS-created page would never be published (404).
- Not applied (pending user decisions, both already tracked): the "expired 2026 event date"
  comment (CONTENT-REVIEW-FINDINGS item 12 — hero/reglages next-edition decision) and the
  mentions-légales placeholder comment (entity details must come from the user).

### Notes / outstanding before go-live
- No tutorial has per-step photos except Nakamura & Flèche (real WordPress photos). The 4
  tutorials on the generic illustration still need real folding photos or commissioned art —
  decision pending. Lighthouse, browser QA, live 301 tests, CMS OAuth, and Cloudflare deploy
  remain manual steps. See `docs/CONTENT-REVIEW.md`.
