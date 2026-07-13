# WordPress → Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WordPress/Elementor site championnatavionpapier.fr with a fully static, mobile-first Astro site (French), editable by non-technical users via Sveltia CMS, hosted on Cloudflare Workers static assets, with expanded SEO content and a complete 301 redirect map preserving search equity.

**Architecture:** Astro 5 static output (`output: 'static'`). Content lives in Markdown/JSON content collections validated by Zod, edited through Sveltia CMS at `/admin` (git-based: saves commit to the repo, triggering a Cloudflare Workers Build). No server runtime for the site itself; a single tiny Worker (`sveltia-cms-auth`) handles the GitHub OAuth handshake for the CMS. SEO structured data (Event/HowTo/FAQPage/Organization/BreadcrumbList) is emitted as JSON-LD from Astro components. Redirects ship as a `_redirects` file served by Workers static assets.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), `astro:assets` (Sharp), `@astrojs/sitemap`, `@astrojs/rss`, Sveltia CMS, Cloudflare Workers (static assets + one OAuth Worker via Wrangler), Node 22+ (dev machine has v26).

## Global Constraints

- Language: **French (fr-FR)** only. All UI copy, slugs, labels, and content in French. Architecture must not preclude adding `/en/` later, but no EN routes now.
- Canonical event facts (single source of truth = `reglages` singleton): **samedi 13 juin 2026**, **Complexe sportif Daniel Colombier, Mérignac**, sélections **11h–15h**, finales **15h30**; compétiteur **8 €**, visiteurs **entrée libre**; beneficiary **Pompiers Solidaires**. DFCI appears ONLY in historical edition records (2023/2024), never as the current cause.
- Registration CTA URL (canonical, tracking param stripped): `https://www.helloasso.com/associations/rotary-merignac/evenements/championnat-du-monde-de-lancer-d-avions-en-papier-2026`
- Contact email: `contact@championnatavionpapier.fr`. Privacy email: `privacy@championnatavionpapier.fr`.
- Base URL: `https://championnatavionpapier.fr` (used for canonicals, sitemap, OG, JSON-LD `url`).
- Every migrated page/post keeps its existing URL path verbatim unless listed in the redirect map (Task 18). Rank Math SEO titles/descriptions are copied verbatim into frontmatter.
- Performance budget: zero client JS by default; Lighthouse mobile ≥ 95 (target 100) on home, one tutorial, and FAQ. Images via `astro:assets` only (no raw `<img src>` to `/uploads`).
- Never merge to `main` without explicit user approval. Work stays on branch `migrate-wordpress-to-astro`. WordPress stays live until DNS cutover is explicitly approved.
- Source-of-truth content is `championnatavionpapier-content-export.md`; media source is `uploads/`. New French copy is drafted by the implementer and flagged for user review before cutover.

---

## File Structure

```
/  (repo root, branch migrate-wordpress-to-astro)
├── astro.config.mjs            # integrations: sitemap; vite: tailwind; site url; output static
├── package.json
├── tsconfig.json
├── wrangler.jsonc              # Workers static-assets config (name, assets dir, compat date)
├── public/
│   ├── admin/                  # Sveltia CMS entry (index.html + config.yml)
│   ├── files/                  # PDFs (press kits, paper-plane-kit)
│   ├── _redirects              # 301 map (generated + hand-authored)
│   ├── _headers                # cache/security headers
│   ├── robots.txt
│   └── favicon / og fallback
├── src/
│   ├── content.config.ts       # collections + Zod schemas
│   ├── content/
│   │   ├── reglages/           # singleton JSON (event settings)
│   │   ├── pages/              # home, histoire, activites bodies (md)
│   │   ├── tutoriels/          # one md per tutorial (steps in frontmatter)
│   │   ├── actualites/         # blog posts (md)
│   │   ├── editions/           # per-year JSON/md
│   │   ├── sponsors/           # one JSON per sponsor
│   │   ├── faq/                # faq entries (JSON)
│   │   └── records/            # record entries (JSON)
│   ├── assets/                 # curated images (astro:assets processed)
│   ├── fonts/                  # Frutiger woff2 (subset)
│   ├── styles/global.css       # Tailwind v4 import + design tokens
│   ├── lib/                    # helpers: seo.ts, schema.ts, dates.ts
│   ├── components/
│   │   ├── seo/                # BaseHead.astro, JsonLd.astro, EventSchema.astro, HowToSchema.astro, FaqSchema.astro, BreadcrumbSchema.astro
│   │   ├── layout/             # Header.astro, Footer.astro, Nav.astro
│   │   └── ui/                 # Hero, CtaBanner, TutorialCard, StepList, Gallery, RecordsTable, SponsorGrid, LiteYouTube, FlightDivider, FaqAccordion, Breadcrumbs
│   ├── layouts/                # BaseLayout.astro, PageLayout.astro, TutorialLayout.astro, ArticleLayout.astro
│   └── pages/                  # route files (.astro) mapping to URLs
├── workers/
│   └── sveltia-cms-auth/       # OAuth Worker (separate wrangler.toml)
├── scripts/
│   ├── check-links.mjs
│   └── check-redirects.mjs
└── _source/                    # raw WP export, WXR, Search Console CSVs (reference, not built)
```

Route files in `src/pages/` map 1:1 to final URLs (Astro trailing-slash default `ignore`; we set `trailingSlash: 'always'` to match WP URLs like `/histoire-championnat-avion-papier/`).

---

## Task 1: Repo restructure & source archiving

**Files:**
- Create: `_source/` (move raw exports here)
- Create: `.gitignore` additions
- Move: `championnatavionpapier-content-export.md`, `lesiteduchampionnat…2026-07-13.xml`, `championnatavionpapier.fr-Performance-on-Search-2026-07-14/` → `_source/`

**Interfaces:**
- Produces: `_source/` reference tree; clean repo root ready for Astro scaffold.

- [ ] **Step 1: Move raw source files into `_source/`**

```bash
cd "C:/Users/nicol/Documents/GitHub/championnat-avion-papier"
mkdir -p _source
git mv championnatavionpapier-content-export.md _source/
git mv "lesiteduchampionnatdumondedelancerd039avionsenpapierdemrignac.WordPress.2026-07-13.xml" _source/
git mv "championnatavionpapier.fr-Performance-on-Search-2026-07-14" _source/search-console/
```

- [ ] **Step 2: Keep `uploads/` in place for now** (curated in Task 8; do not delete yet).

- [ ] **Step 3: Verify move**

Run: `ls _source/`
Expected: the markdown export, the `.xml`, and `search-console/` present.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: archive WordPress source exports under _source/"
```

---

## Task 2: Astro scaffold + Tailwind v4 + config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro` (placeholder)
- Create: `wrangler.jsonc`

**Interfaces:**
- Produces: a building Astro project. `npm run build` emits `dist/`. Tailwind utilities available via `global.css`.

- [ ] **Step 1: Initialize Astro (empty template, TypeScript strict)**

```bash
npm create astro@latest . -- --template minimal --install --no-git --typescript strict --yes
```

If the directory-not-empty prompt blocks non-interactively, scaffold in a temp dir and copy `src/`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/` over, preserving `_source/`, `uploads/`, `docs/`, `.git/`.

- [ ] **Step 2: Add integrations and Tailwind v4**

```bash
npx astro add sitemap --yes
npm i tailwindcss @tailwindcss/vite @astrojs/rss sharp
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://championnatavionpapier.fr',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Write `src/styles/global.css`** (tokens filled in Task 3; minimal here)

```css
@import "tailwindcss";
```

- [ ] **Step 5: Placeholder home + import CSS via a temp layout**, then build

```bash
npm run build
```
Expected: build succeeds, `dist/index.html` exists.

- [ ] **Step 6: Write `wrangler.jsonc`**

```jsonc
{
  "name": "championnat-avion-papier",
  "compatibility_date": "2026-07-01",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Astro 5 + Tailwind v4 + sitemap + wrangler config"
```

---

## Task 3: Design tokens, fonts, base layout & head

**Files:**
- Create: `src/fonts/` (Frutiger woff2 subset), `src/styles/global.css` (tokens), `src/components/seo/BaseHead.astro`, `src/layouts/BaseLayout.astro`, `src/lib/seo.ts`

**Interfaces:**
- Produces:
  - `BaseLayout` props: `{ title: string; description: string; image?: string; canonical?: string; noindex?: boolean }`
  - `BaseHead` same props; emits `<title>`, meta description, canonical, OG/Twitter tags, favicon, Cloudflare Web Analytics beacon.
  - CSS custom properties: `--color-sky`, `--color-sky-deep`, `--color-paper`, `--color-ink`, `--color-orange` (safety accent), font families `--font-brand` (Frutiger), `--font-body`.

- [ ] **Step 1: Subset Frutiger to woff2**

Source TTFs are in `uploads/**/Frutiger.ttf` and `Frutiger_bold.ttf` (locate exact paths via `find uploads -iname 'Frutiger*'`). Subset to Latin + French accents:

```bash
npm i -D fonttools-wasm || pip install fonttools brotli
pyftsubset uploads/path/Frutiger.ttf --output-file=src/fonts/frutiger.woff2 --flavor=woff2 --layout-features='*' --unicodes=U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+2000-206F,U+20AC
pyftsubset uploads/path/Frutiger_bold.ttf --output-file=src/fonts/frutiger-bold.woff2 --flavor=woff2 --unicodes=U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC
```

(If Frutiger licensing is unclear, fall back to a self-hosted humanist sans like `Frutiger`-alike **"Fira Sans"** / **"Inter"** — flag to user. Plan continues assuming Frutiger is licensed for web, per its presence in the WP media library.)

- [ ] **Step 2: Write `src/styles/global.css` tokens + font-face**

```css
@import "tailwindcss";

@font-face {
  font-family: "Frutiger";
  src: url("/src/fonts/frutiger.woff2") format("woff2");
  font-weight: 400; font-display: swap;
}
@font-face {
  font-family: "Frutiger";
  src: url("/src/fonts/frutiger-bold.woff2") format("woff2");
  font-weight: 700; font-display: swap;
}

@theme {
  --color-sky: #4ba3e3;
  --color-sky-deep: #0b4a8f;
  --color-paper: #f7f9fb;
  --color-ink: #14202e;
  --color-orange: # f26a1b;
  --font-brand: "Frutiger", system-ui, sans-serif;
  --font-body: "Frutiger", system-ui, sans-serif;
}

:root { color-scheme: light; }
body { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-body); }
```

(Fix the `--color-orange` value to `#f26a1b` — no space; shown here to be corrected on write.)

- [ ] **Step 3: Write `src/lib/seo.ts`**

```ts
export const SITE = {
  url: 'https://championnatavionpapier.fr',
  name: 'Championnat du Monde de Lancer d’Avions en Papier',
  locale: 'fr_FR',
  twitter: '',
  defaultImage: '/og-default.jpg',
} as const;

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}
```

- [ ] **Step 4: Write `src/components/seo/BaseHead.astro`**

```astro
---
import { SITE, absolute } from '../../lib/seo';
interface Props { title: string; description: string; image?: string; canonical?: string; noindex?: boolean; }
const { title, description, image = SITE.defaultImage, canonical, noindex = false } = Astro.props;
const canonicalURL = canonical ?? absolute(Astro.url.pathname);
const ogImage = absolute(image);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
{noindex && <meta name="robots" content="noindex,nofollow" />}
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:image" content={ogImage} />
<meta property="og:locale" content={SITE.locale} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<slot />
```

- [ ] **Step 5: Write `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/seo/BaseHead.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import '../styles/global.css';
interface Props { title: string; description: string; image?: string; canonical?: string; noindex?: boolean; }
const { title, description, image, canonical, noindex } = Astro.props;
---
<!doctype html>
<html lang="fr">
  <head>
    <BaseHead {title} {description} {image} {canonical} {noindex} />
    <slot name="head" />
  </head>
  <body>
    <Header />
    <main><slot /></main>
    <Footer />
    <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token":"REPLACE_WITH_CF_ANALYTICS_TOKEN"}`}></script>
  </body>
</html>
```

- [ ] **Step 6: Stub `Header.astro` / `Footer.astro`** (filled in Task 6) so the layout builds. Build:

```bash
npm run build
```
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: design tokens, Frutiger fonts, BaseLayout + SEO head"
```

---

## Task 4: Content collections & Zod schemas

**Files:**
- Create: `src/content.config.ts`
- Create: seed files — `src/content/reglages/reglages.json`, one sample per collection so the build validates.

**Interfaces:**
- Produces the canonical shapes every content/page task consumes:
  - `reglages` (JSON, single entry id `reglages`): `{ dateISO: string; dateLabel: string; lieu: string; ville: string; horaireSelections: string; horaireFinales: string; tarifCompetiteur: string; entreeVisiteur: string; beneficiaire: string; helloAssoUrl: string; emailContact: string; emailPrivacy: string; instagram?: string; facebook?: string }`
  - `tutoriels`: frontmatter `{ title; seoTitle; seoDescription; slug?; difficulte: 'facile'|'intermediaire'|'avance'; typeVol: 'distance'|'duree'|'polyvalent'; dureePliage: string; image: image(); imageAlt: string; etapes: { texte: string; image?: image(); alt?: string }[]; materiel: string[]; faq: { q: string; r: string }[]; tags: string[]; datePublication: coerce.date; dateMaj?: coerce.date; draft?: boolean }` + markdown body (intro/context).
  - `actualites`: `{ title; seoTitle?; description; image?: image(); imageAlt?; datePublication: coerce.date; dateMaj?: coerce.date; tags: string[]; draft?: boolean }` + body.
  - `editions`: `{ annee: number; lieu: string; participants?: number; nations?: number; parrain?: string; faitsMarquants: string[]; records: { categorie: string; detenteur: string; valeur: string }[]; galerie?: { image: image(); alt: string }[]; beneficiaire?: string }`.
  - `sponsors`: `{ nom: string; url: string; logo?: image(); descriptif: string; ordre: number }`.
  - `faq`: `{ question: string; reponse: string; categorie: 'pratique'|'inscription'|'sur-place'|'general'; ordre: number }`.
  - `records`: `{ categorie: string; detenteur: string; valeur: string; annee: number; contexte?: string; actuel: boolean }`.
  - `pages`: markdown bodies for home/histoire/activites with per-page SEO frontmatter `{ title; seoTitle; seoDescription; image?: image(); imageAlt? }`.

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const reglages = defineCollection({
  loader: file('src/content/reglages/reglages.json'),
  schema: z.object({
    dateISO: z.string(),
    dateLabel: z.string(),
    lieu: z.string(),
    ville: z.string(),
    horaireSelections: z.string(),
    horaireFinales: z.string(),
    tarifCompetiteur: z.string(),
    entreeVisiteur: z.string(),
    beneficiaire: z.string(),
    helloAssoUrl: z.string().url(),
    emailContact: z.string().email(),
    emailPrivacy: z.string().email(),
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
  }),
});

const tutoriels = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/tutoriels' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    difficulte: z.enum(['facile', 'intermediaire', 'avance']),
    typeVol: z.enum(['distance', 'duree', 'polyvalent']),
    dureePliage: z.string(),
    image: image(),
    imageAlt: z.string(),
    etapes: z.array(z.object({ texte: z.string(), image: image().optional(), alt: z.string().optional() })),
    materiel: z.array(z.string()).default(['Une feuille A4']),
    faq: z.array(z.object({ q: z.string(), r: z.string() })).default([]),
    tags: z.array(z.string()).default([]),
    datePublication: z.coerce.date(),
    dateMaj: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const actualites = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/actualites' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    image: image().optional(),
    imageAlt: z.string().optional(),
    datePublication: z.coerce.date(),
    dateMaj: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const editions = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/editions' }),
  schema: ({ image }) => z.object({
    annee: z.number(),
    lieu: z.string(),
    participants: z.number().optional(),
    nations: z.number().optional(),
    parrain: z.string().optional(),
    faitsMarquants: z.array(z.string()).default([]),
    records: z.array(z.object({ categorie: z.string(), detenteur: z.string(), valeur: z.string() })).default([]),
    galerie: z.array(z.object({ image: image(), alt: z.string() })).default([]),
    beneficiaire: z.string().optional(),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/sponsors' }),
  schema: ({ image }) => z.object({
    nom: z.string(), url: z.string().url(),
    logo: image().optional(), descriptif: z.string(), ordre: z.number().default(99),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(), reponse: z.string(),
    categorie: z.enum(['pratique', 'inscription', 'sur-place', 'general']),
    ordre: z.number().default(99),
  }),
});

const records = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/records' }),
  schema: z.object({
    categorie: z.string(), detenteur: z.string(), valeur: z.string(),
    annee: z.number(), contexte: z.string().optional(), actuel: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pages' }),
  schema: ({ image }) => z.object({
    title: z.string(), seoTitle: z.string(), seoDescription: z.string(),
    image: image().optional(), imageAlt: z.string().optional(),
  }),
});

export const collections = { reglages, tutoriels, actualites, editions, sponsors, faq, records, pages };
```

- [ ] **Step 2: Seed `src/content/reglages/reglages.json`** with the canonical facts from Global Constraints.

- [ ] **Step 3: Add one valid seed entry per collection** (tutoriel, actualite, edition, sponsor, faq, record, page) referencing a real curated image (after Task 8) or a temporary placeholder in `src/assets/placeholder.avif`.

- [ ] **Step 4: Validate**

Run: `npx astro sync && npx astro check`
Expected: no schema errors; `astro:content` types generated.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: content collections + Zod schemas + seed reglages"
```

---

## Task 5: Media curation & asset pipeline

**Files:**
- Create: `src/assets/**` (curated originals), `public/files/**` (PDFs)
- Delete: WP thumbnail variants and plugin junk from `uploads/` after copying originals; then remove `uploads/` from the repo root (archive under `_source/uploads-original/` if you want a safety copy — gitignored).

**Interfaces:**
- Produces named, deduplicated image files referenced by content frontmatter. Naming: kebab-case, meaningful (`nakamura-etape-1.avif`, `flyer-2026.webp`, `pompiers-solidaires-rotary.avif`).

- [ ] **Step 1: Identify the 222 originals** (exclude `-WIDTHxHEIGHT` variants) under `uploads/2025`, `uploads/2026` and the fonts/PDFs/videos noted in the analysis.

- [ ] **Step 2: Copy needed images → `src/assets/`** grouped by usage (`tutoriels/`, `editions/`, `event/`, `press/`), renamed meaningfully. Copy the 3 PDFs → `public/files/`. Copy the 10s teaser mp4 → `public/files/` (championship film stays on YouTube).

- [ ] **Step 3: Update seed content** frontmatter to point at real curated assets.

- [ ] **Step 4: Remove `uploads/` from repo** (keep a local gitignored archive):

```bash
mv uploads _source/uploads-original   # gitignored
echo "_source/uploads-original/" >> .gitignore
```

- [ ] **Step 5: Build to confirm image processing**

Run: `npm run build`
Expected: `astro:assets` optimizes referenced images; no missing-asset errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: curate media into src/assets + public/files, drop WP thumbnails"
```

---

## Task 6: Header, Nav, Footer

**Files:**
- Create: `src/components/layout/Header.astro`, `Nav.astro`, `Footer.astro`; `src/lib/nav.ts`

**Interfaces:**
- Consumes: `reglages` (for the S'inscrire CTA URL and footer contact).
- Produces: site chrome used by `BaseLayout`. `NAV_ITEMS` array in `src/lib/nav.ts`: `{ label: string; href: string; children?: {label;href}[] }[]`.

- [ ] **Step 1: Write `src/lib/nav.ts`**

```ts
export const NAV_ITEMS = [
  { label: 'Accueil', href: '/' },
  { label: 'Le Championnat', href: '/histoire-championnat-avion-papier/', children: [
    { label: 'Histoire', href: '/histoire-championnat-avion-papier/' },
    { label: 'Activités', href: '/activites/' },
    { label: 'Éditions', href: '/editions/2025/' },
    { label: 'Records', href: '/records-avion-en-papier/' },
  ]},
  { label: 'Tutoriels', href: '/ressources-avions-papier/' },
  { label: 'Actualités', href: '/blog/' },
  { label: 'Contact & FAQ', href: '/contact-faq/' },
];
```

- [ ] **Step 2: Write `Header.astro` + `Nav.astro`** — mobile-first: logo left, hamburger toggling an accessible `<details>`-based or CSS-only menu (no framework JS), sticky "S'inscrire" button (orange) linking to `reglages.helloAssoUrl` with `rel="noopener"`. Highlight active route via `Astro.url.pathname`.

- [ ] **Step 3: Write `Footer.astro`** — columns: navigation, partenaires (link `/sponsors/`), le Rotary Mérignac (external), Pompiers Solidaires (external), presse (`/presse/`), légal (`/mentions-legales/`, `/politique-de-confidentialite/`), contact email (mailto), Instagram/Facebook from `reglages`.

- [ ] **Step 4: Build + eyeball at mobile width** (use `/run` or Chrome MCP at 390px). Verify hamburger opens/closes without JS errors.

Run: `npm run build && npm run preview`
Expected: header/footer render; menu keyboard-accessible.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: header/nav (mobile-first) + footer"
```

---

## Task 7: UI component kit

**Files:**
- Create under `src/components/ui/`: `Hero.astro`, `CtaBanner.astro`, `TutorialCard.astro`, `StepList.astro`, `Gallery.astro`, `RecordsTable.astro`, `SponsorGrid.astro`, `LiteYouTube.astro`, `FlightDivider.astro`, `FaqAccordion.astro`, `Breadcrumbs.astro`

**Interfaces (props each later task relies on):**
- `Hero`: `{ title; subtitle?; dateLabel; ctaLabel; ctaHref; image?: ImageMetadata; imageAlt? }`
- `CtaBanner`: `{ heading; text?; href; label }`
- `TutorialCard`: `{ title; href; image: ImageMetadata; imageAlt; difficulte; typeVol; dureePliage }`
- `StepList`: `{ etapes: {texte; image?: ImageMetadata; alt?}[] }`
- `Gallery`: `{ items: {image: ImageMetadata; alt}[] }`
- `RecordsTable`: `{ records: {categorie; detenteur; valeur; annee; actuel}[] }` (departures-board styling)
- `SponsorGrid`: `{ sponsors: {nom; url; logo?: ImageMetadata; descriptif}[] }`
- `LiteYouTube`: `{ id: string; title: string }` (facade image + click-to-load iframe, no JS libs — one small inline script)
- `FlightDivider`: decorative dotted-trajectory SVG, no props
- `FaqAccordion`: `{ items: {question; reponse}[] }` (native `<details>`)
- `Breadcrumbs`: `{ trail: {label; href}[] }`

- [ ] **Step 1: Implement each component** using `astro:assets` `<Image>` for images (responsive `widths`, AVIF), semantic HTML, Tailwind tokens. `LiteYouTube` uses a `<button>` facade that swaps in the iframe on click via a tiny inline `<script>` (progressive enhancement; link fallback to youtube.com).

- [ ] **Step 2: Create a throwaway `/src/pages/_kitchen-sink.astro`** rendering every component with sample props; build & visually verify; then delete it before commit (or keep behind `import.meta.env.DEV`).

Run: `npm run build`
Expected: all components compile; images optimize.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: UI component kit (hero, cards, steps, gallery, records, sponsors, lite-youtube, faq, breadcrumbs)"
```

---

## Task 8: JSON-LD structured-data components

**Files:**
- Create: `src/components/seo/JsonLd.astro`, `EventSchema.astro`, `HowToSchema.astro`, `FaqSchema.astro`, `OrganizationSchema.astro`, `BreadcrumbSchema.astro`; `src/lib/schema.ts`

**Interfaces:**
- `JsonLd`: `{ data: object }` → renders `<script type="application/ld+json">`.
- `EventSchema`: `{ reglages }` → schema.org/Event (name, startDate from `dateISO`, location PostalAddress Mérignac, offers 8 €, organizer Rotary, eventStatus).
- `HowToSchema`: `{ title; description; etapes; totalTime }` → schema.org/HowTo with `HowToStep` list.
- `FaqSchema`: `{ items: {question;reponse}[] }` → FAQPage.
- `OrganizationSchema`: static org data.
- `BreadcrumbSchema`: `{ trail }` → BreadcrumbList.

- [ ] **Step 1: Write `src/lib/schema.ts`** with builder functions returning plain JS objects (pure, unit-testable):

```ts
export function buildEvent(r: { dateISO: string; lieu: string; ville: string; tarifCompetiteur: string; helloAssoUrl: string; beneficiaire: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Event',
    name: 'Championnat du Monde de Lancer d’Avions en Papier',
    startDate: r.dateISO,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: r.lieu, address: { '@type': 'PostalAddress', addressLocality: r.ville, addressCountry: 'FR' } },
    offers: { '@type': 'Offer', price: '8', priceCurrency: 'EUR', url: r.helloAssoUrl, availability: 'https://schema.org/InStock' },
    organizer: { '@type': 'Organization', name: 'Rotary Club de Mérignac', url: 'https://www.rotary-merignac.fr/' },
  };
}
export function buildHowTo(title: string, description: string, etapes: {texte:string}[], totalTime?: string) {
  return {
    '@context': 'https://schema.org', '@type': 'HowTo', name: title, description,
    ...(totalTime ? { totalTime } : {}),
    step: etapes.map((e, i) => ({ '@type': 'HowToStep', position: i + 1, text: e.texte })),
  };
}
export function buildFaq(items: {question:string;reponse:string}[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.reponse } })),
  };
}
```

- [ ] **Step 2: Write a unit test** `src/lib/schema.test.ts` (add `vitest`):

```ts
import { describe, it, expect } from 'vitest';
import { buildEvent, buildHowTo, buildFaq } from './schema';

describe('schema builders', () => {
  it('event has ISO startDate and 8 EUR offer', () => {
    const e = buildEvent({ dateISO: '2026-06-13T11:00:00+02:00', lieu: 'Complexe sportif Daniel Colombier', ville: 'Mérignac', tarifCompetiteur: '8 €', helloAssoUrl: 'https://x', beneficiaire: 'Pompiers Solidaires' });
    expect(e.startDate).toBe('2026-06-13T11:00:00+02:00');
    expect(e.offers.price).toBe('8');
  });
  it('howto numbers steps from 1', () => {
    const h = buildHowTo('t', 'd', [{texte:'a'},{texte:'b'}]);
    expect(h.step[1].position).toBe(2);
  });
  it('faq maps questions', () => {
    const f = buildFaq([{question:'q',reponse:'r'}]);
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('r');
  });
});
```

- [ ] **Step 3: Run test → fail (no vitest yet), install, pass**

```bash
npm i -D vitest && npx vitest run src/lib/schema.test.ts
```
Expected: 3 passing.

- [ ] **Step 4: Write the `.astro` wrappers** that call these builders and render via `JsonLd`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: JSON-LD builders (Event/HowTo/FAQ/Org/Breadcrumb) + tests"
```

---

## Task 9: Layouts for pages, tutorials, articles

**Files:**
- Create: `src/layouts/PageLayout.astro`, `TutorialLayout.astro`, `ArticleLayout.astro`

**Interfaces:**
- `PageLayout`: `{ title; seoTitle; seoDescription; breadcrumb: {label;href}[] }` — wraps `BaseLayout`, adds `Breadcrumbs` + `BreadcrumbSchema`.
- `TutorialLayout`: `{ entry }` (a `tutoriels` entry) — renders Hero, materiel, `StepList`, `FaqAccordion`, `HowToSchema` + `FaqSchema`, related tutorials, CTA banner.
- `ArticleLayout`: `{ entry }` (an `actualites` entry) — title, date, body, share.

- [ ] **Step 1: Implement the three layouts** consuming Task 7 UI + Task 8 schema components.
- [ ] **Step 2: Build.** Expected: success.
- [ ] **Step 3: Commit** `feat: page/tutorial/article layouts`.

---

## Task 10: Home page

**Files:**
- Create: `src/content/pages/accueil.md`, `src/pages/index.astro`

**Interfaces:**
- Consumes: `reglages`, `sponsors`, `EventSchema`, `Hero`, `CtaBanner`, `FlightDivider`.

- [ ] **Step 1: Author `accueil.md`** — restructured home copy (dedupe the children-activities block, keep it only here or on `/activites/`, not verbatim on both; single beneficiary = Pompiers Solidaires; canonical 2026 facts from `reglages`). SEO title/description verbatim from Rank Math.
- [ ] **Step 2: Build `index.astro`** — Hero (date + sticky CTA), intro, "activités enfants" teaser → link to `/activites/`, history teaser → `/histoire-…/`, sponsors strip (`SponsorGrid`), Pompiers Solidaires cause block, `EventSchema` in `<slot name="head">`.
- [ ] **Step 3: Build + Lighthouse mobile** on `/`. Expected: ≥ 95, Event schema valid.
- [ ] **Step 4: Commit** `feat: home page + Event schema`.

---

## Task 11: Histoire & Activités pages

**Files:**
- Create: `src/content/pages/histoire.md`, `src/content/pages/activites.md`, `src/pages/histoire-championnat-avion-papier/index.astro`, `src/pages/activites/index.astro`

- [ ] **Step 1: Author `histoire.md`** from the export's history content; fix stale "17 mai 2025" and DFCI-as-current; keep the year-by-year table (render as styled table). Records mentioned here link to `/records-avion-en-papier/`.
- [ ] **Step 2: Author `activites.md`** — day schedule (11h–15h sélections, 15h30 finales), children activities (canonical copy), distance/durée explainer, cause section (Pompiers Solidaires).
- [ ] **Step 3: Build both routes** via `PageLayout` with breadcrumbs.
- [ ] **Step 4: Build.** Expected: success, both URLs render with trailing slash.
- [ ] **Step 5: Commit** `feat: histoire + activites pages`.

---

## Task 12: Contact & FAQ page + FAQ content

**Files:**
- Create: `src/content/faq/*.json` (15–20 entries), `src/pages/contact-faq/index.astro`

**Interfaces:** Consumes `faq` collection, `reglages`, `FaqAccordion`, `FaqSchema`.

- [ ] **Step 1: Author 15–20 FAQ entries** across categories (pratique/inscription/sur-place/general) — expand from the thin original; answer real Search Console questions (tarif, horaires, parking, restauration, âge, matériel, inscription HelloAsso, accès Complexe Daniel Colombier, cause Pompiers Solidaires, records).
- [ ] **Step 2: Build `contact-faq/index.astro`** — practical info block (from `reglages`), mailto contact, press-kit PDF links (`/files/…`), Google Calendar add link, `FaqAccordion` grouped by category, `FaqSchema` in head.
- [ ] **Step 3: Validate FAQ schema** (Rich Results). Expected: valid FAQPage.
- [ ] **Step 4: Commit** `feat: expanded contact-faq page + FAQPage schema`.

---

## Task 13: Tutorials hub + migrate existing tutorials + revive Intercepteur

**Files:**
- Create: `src/pages/ressources-avions-papier/index.astro` (hub), `src/pages/[...tutoriel].astro` OR `src/pages/tutoriels/[slug].astro` mapped to legacy flat URLs (see Step 1), `src/content/tutoriels/*.md`

**Interfaces:** Consumes `tutoriels`, `TutorialLayout`, `TutorialCard`.

- [ ] **Step 1: Decide routing to preserve flat legacy URLs.** Existing tutorial URLs are flat (`/plier-avion-en-papier-nakamura/`). Create per-tutorial route files or a `getStaticPaths` in `src/pages/[tutoriel]/index.astro` that emits each tutorial's exact legacy slug as a top-level path. Map slug→entry explicitly to avoid collisions with other top-level pages.
- [ ] **Step 2: Migrate the 3 strong tutorials verbatim-ish into schema:** Nakamura (`plier-avion-en-papier-nakamura`), Flèche Classique (`plier-avion-en-papier-fleche-classique`), and the STEM history becomes an *article* not a tutorial → goes to `actualites` (Task 15). Populate `etapes[]` with step text + curated step images; carry Rank Math seoTitle/seoDescription verbatim.
- [ ] **Step 3: Revive Intercepteur** — author `plier-avion-en-papier-intercepteur.md` (draft in WP) as the 3rd competition tutorial, using its existing Rank Math title/description/keywords; `draft: false`.
- [ ] **Step 4: Build the hub** — pillar page for `/ressources-avions-papier/`: intro targeting "avion en papier planeur/tuto", grid of `TutorialCard`s grouped by typeVol (distance/durée), links to records + imprimer pages.
- [ ] **Step 5: Build.** Expected: each legacy tutorial URL renders with HowTo + FAQ schema; hub lists all.
- [ ] **Step 6: Commit** `feat: tutorials hub + migrate Nakamura/Flèche + revive Intercepteur`.

---

## Task 14: Rewrite thin tutorials + new tutorials (rond, lanceur)

**Files:**
- Create/rewrite: `src/content/tutoriels/tuto-avion-en-papier-facile-planeur.md`, `tuto-avion-en-papier-le-faucon.md`, `plier-un-avion-en-papier-3.md`, `avion-papier-rond.md`, `lanceur-avion-en-papier.md`

**Interfaces:** same `tutoriels` schema.

- [ ] **Step 1: Rewrite `tuto-avion-en-papier-facile-planeur`** (the #1 traffic page, currently ~120 words) into a full step-by-step planeur tutorial with photos + HowTo + FAQ. This is the single highest-ROI content task — keep the exact URL.
- [ ] **Step 2: Rewrite `le-faucon` and `plier-un-avion-en-papier-3`** to full tutorials (keep URLs; the latter also receives a 301 from `plier-un-avion-en-papier-classique` per Task 18).
- [ ] **Step 3: New `avion-papier-rond`** targeting "avion en papier rond/circulaire" (~500 impressions, no current content) — new URL `/avion-en-papier-rond/`.
- [ ] **Step 4: New `lanceur-avion-en-papier`** targeting "lanceur d'avion en papier" — new URL `/lanceur-avion-en-papier/`.
- [ ] **Step 5: Consolidate** `plier-avion-papier-facile` → do NOT recreate as a page; it 301s into Flèche Classique (Task 18). Remove from tutorials.
- [ ] **Step 6: Build + Lighthouse** on the planeur rewrite. Expected: ≥ 95, HowTo valid.
- [ ] **Step 7: Commit** `feat: rewrite thin tutorials + add rond & lanceur tutorials`.

---

## Task 15: Blog/Actualités + RSS + STEM article

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug]/index.astro`, `src/pages/rss.xml.ts`, `src/content/actualites/histoire-avions-papier.md` (migrated STEM piece) + any announcements.

- [ ] **Step 1: Migrate STEM history post** into `actualites` (evergreen, ~900w) keeping URL `/histoire-avions-papier/` — add a route alias so the article renders at its legacy flat URL (like Task 13 mapping), not under `/blog/`.
- [ ] **Step 2: Build blog index** (`/blog/`, currently empty) listing `actualites` sorted by date.
- [ ] **Step 3: RSS** via `@astrojs/rss` at `/rss.xml`.
- [ ] **Step 4: Build.** Expected: blog index populated, RSS validates.
- [ ] **Step 5: Commit** `feat: actualités index + RSS + migrate STEM article`.

---

## Task 16: Records, Éditions, Sponsors, Presse, Imprimer pages

**Files:**
- Create: `src/content/records/*.json`, `src/content/editions/2025.json` (+2024, 2023 summaries), `src/content/sponsors/*.json` (13), and routes `src/pages/records-avion-en-papier/index.astro`, `src/pages/editions/[annee]/index.astro`, `src/pages/sponsors/index.astro`, `src/pages/presse/index.astro`, `src/pages/avion-papier-a-imprimer/index.astro`

- [ ] **Step 1: Records** — seed record entries (88,31 m 2022 US team; Kevin Cernik 47 m adulte 2024; Benoît Maury >7 s durée 2024) + `actuel` flags. Build `/records-avion-en-papier/` with `RecordsTable` (departures-board styling), targeting "record du monde avion en papier".
- [ ] **Step 2: Éditions** — `2025.json`, `2024.json`, `2023.json` from the history data (venue, participants, nations, faits marquants, records, galleries from curated photos). Route `editions/[annee]/`.
- [ ] **Step 3: Sponsors** — 13 JSON entries (name/url/descriptif from the export). Build `/sponsors/` with `SponsorGrid`.
- [ ] **Step 4: Presse** — `/presse/` with press pull-quotes (Sud Ouest, France Bleu, CNews), press-kit PDFs, contact.
- [ ] **Step 5: Imprimer** — `/avion-papier-a-imprimer/` offering the `Paper-plane-kit.pdf` + printable templates, targeting "avion en papier à imprimer/gabarit".
- [ ] **Step 6: Build.** Expected: all five routes render.
- [ ] **Step 7: Commit** `feat: records, éditions, sponsors, presse, imprimer pages`.

---

## Task 17: Legal pages (privacy FR, mentions légales)

**Files:**
- Create: `src/pages/politique-de-confidentialite/index.astro` (+ md body), `src/pages/mentions-legales/index.astro`

- [ ] **Step 1: Migrate FR privacy policy** verbatim (from export), update contact to `privacy@…`, `noindex` optional off (keep indexable).
- [ ] **Step 2: Author `mentions-legales`** — French legal notice (éditeur = Rotary Club de Mérignac, hébergeur = Cloudflare, contact). Flag to user to confirm legal entity details.
- [ ] **Step 3: EN `/privacy-policy/` is NOT recreated** — it 301s to the FR policy (Task 18).
- [ ] **Step 4: Build + commit** `feat: privacy + mentions légales`.

---

## Task 18: Redirect map + robots + headers

**Files:**
- Create: `public/_redirects`, `public/robots.txt`, `public/_headers`, `scripts/check-redirects.mjs`

**Interfaces:** `_redirects` lines `FROM  TO  301`.

- [ ] **Step 1: Author `public/_redirects`** with the full map derived from the analyses:

```
# Artifact slugs
/contact-faq-2-2/            /activites/                         301
# EN privacy → FR
/privacy-policy/             /politique-de-confidentialite/      301
# _wp_old_slug history
/plier-un-avion-en-papier-classique/  /plier-un-avion-en-papier-3/  301
/tuto-avion-en-papier-facile/         /tuto-avion-en-papier-facile-planeur/  301
# Consolidated duplicate tutorial
/plier-avion-papier-facile/  /plier-avion-en-papier-fleche-classique/  301
# Archive/taxonomy URLs Google indexed
/tuto/                       /ressources-avions-papier/          301
/tag/*                       /ressources-avions-papier/          301
/blog/page/*                 /blog/                              301
# rank_math_auto_redirect numeric-id merges (add each ?p=ID / old path → survivor)
```

Fill in the emoji old-slug for Le Faucon and each `rank_math_auto_redirect` source discovered in `_source/*.xml` (grep `rank_math_auto_redirect` and `_wp_old_slug`).

- [ ] **Step 2: `public/robots.txt`** — allow all, point to `https://championnatavionpapier.fr/sitemap-index.xml`.
- [ ] **Step 3: `public/_headers`** — long cache for `/_astro/*` and images; sensible security headers.
- [ ] **Step 4: Write `scripts/check-redirects.mjs`** — reads `_redirects`, and after `wrangler dev`/preview, curls each FROM and asserts a 301 to TO. (Runs in Task 20 QA.)
- [ ] **Step 5: Commit** `feat: 301 redirect map + robots + headers`.

---

## Task 19: Sitemap, canonicals audit, OG image

**Files:**
- Modify: `astro.config.mjs` (sitemap options: `filter` out `noindex`), add default OG image `public/og-default.jpg`.

- [ ] **Step 1: Configure sitemap** to exclude any `noindex` routes; verify `/sitemap-index.xml` builds.
- [ ] **Step 2: Add a branded default OG image** (1200×630) from the flyer/logo.
- [ ] **Step 3: Build + inspect** `dist/sitemap-*.xml` includes all real routes, excludes admin.
- [ ] **Step 4: Commit** `feat: sitemap config + default OG image`.

---

## Task 20: Build QA — links, redirects, schema, Lighthouse

**Files:**
- Create: `scripts/check-links.mjs`; add npm scripts.

- [ ] **Step 1: Add scripts** to `package.json`: `"check:links"`, `"check:redirects"`, `"verify": "astro check && astro build && node scripts/check-links.mjs"`.
- [ ] **Step 2: `check-links.mjs`** crawls `dist/**/*.html`, asserts no internal `href` 404s against emitted files and the `_redirects` map.
- [ ] **Step 3: Run full verify**

Run: `npm run verify`
Expected: `astro check` clean, build clean, zero broken internal links.

- [ ] **Step 4: Redirect test** — `wrangler dev` (or `npx wrangler pages dev dist` equivalent for Workers assets) then `node scripts/check-redirects.mjs`. Expected: every FROM → 301 → TO.
- [ ] **Step 5: Schema validation** — paste home/tutorial/FAQ HTML into Rich Results test (or `structured-data-testing-tool`). Expected: Event, HowTo, FAQPage valid, no errors.
- [ ] **Step 6: Lighthouse mobile** on `/`, one tutorial, `/contact-faq/`. Expected: Perf ≥ 95, SEO 100, a11y ≥ 95.
- [ ] **Step 7: Commit** `test: link/redirect/schema QA scripts + fixes`.

---

## Task 21: Sveltia CMS configuration

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`

**Interfaces:** Sveltia reads `config.yml`; backend `github`, `base_url` = the OAuth Worker (Task 22).

- [ ] **Step 1: `public/admin/index.html`** loads Sveltia CMS from its CDN (pinned version), mounts on `/admin/`.
- [ ] **Step 2: `public/admin/config.yml`** — French `label`s, `backend: { name: github, repo: <owner>/championnat-avion-papier, branch: main, base_url: https://<oauth-worker-domain> }`, `media_folder: src/assets/uploads`, `public_folder: ...`. Define collections mirroring `content.config.ts`: `reglages` (file singleton), `tutoriels` (folder, with `etapes` as a `list` widget of `{texte, image}`, `faq` list, etc.), `actualites`, `editions`, `sponsors`, `faq`, `records`, and `pages` (files). Every field `label` in French; widgets: `string`, `text`, `markdown`, `image`, `list`, `select`, `datetime`, `boolean`, `number`.
- [ ] **Step 3: Verify `/admin/` loads** in preview (it will error on auth until Task 22 — that's expected). Confirm the config parses (no red config error in the UI).
- [ ] **Step 4: Commit** `feat: Sveltia CMS config (French labels, all collections)`.

---

## Task 22: Sveltia GitHub OAuth Worker

**Files:**
- Create: `workers/sveltia-cms-auth/wrangler.toml`, `workers/sveltia-cms-auth/src/index.ts`

**Interfaces:** Worker handles `/auth` + `/callback`, exchanges GitHub OAuth code, returns token to Sveltia.

- [ ] **Step 1: Implement the OAuth Worker** (the standard `sveltia-cms-auth` handler: redirects to GitHub authorize, handles callback, posts message back to opener with the token). Config via Worker secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `ALLOWED_DOMAINS`.
- [ ] **Step 2: Create a GitHub OAuth App** (user action — document the steps: homepage `https://championnatavionpapier.fr`, callback `https://<worker-domain>/callback`). Set secrets via `wrangler secret put`.
- [ ] **Step 3: Deploy the Worker** (`wrangler deploy` in `workers/sveltia-cms-auth/`); set `base_url` in `config.yml` to its domain.
- [ ] **Step 4: End-to-end CMS test** — visit `/admin/`, log in with GitHub, edit `reglages.dateLabel`, save → confirm a commit lands on `main`. (Do this on a preview deploy, not production DNS.)
- [ ] **Step 5: Commit** `feat: Sveltia GitHub OAuth Worker + wire base_url`.

---

## Task 23: Cloudflare deploy (preview) + Workers Builds

**Files:**
- Modify: `wrangler.jsonc`; add `.github/` note or use Cloudflare Git integration.

- [ ] **Step 1: Connect the GitHub repo** in Cloudflare → Workers Builds; build command `npm run build`, output `dist`, branch `migrate-wordpress-to-astro` for preview.
- [ ] **Step 2: Add the Cloudflare Web Analytics token** into `BaseLayout` beacon (replace `REPLACE_WITH_CF_ANALYTICS_TOKEN`).
- [ ] **Step 3: Trigger a preview build**; verify the site on the `*.workers.dev` (or preview) URL: routes, redirects (`_redirects` honored by Workers static assets), images, CMS `/admin/`.
- [ ] **Step 4: Full browser QA pass** (Chrome MCP / Playwright) across all routes at 390px and 1280px; capture the home + a tutorial as screenshots for the user.
- [ ] **Step 5: Commit** any config fixes `chore: cloudflare workers build config + analytics token`.

---

## Task 24: Content review, cutover checklist, PR

**Files:**
- Update: `CHANGELOG.md`, `README.md`

- [ ] **Step 1: Compile a content-review packet** for the user — list of all new/rewritten French copy (planeur rewrite, rond, lanceur, expanded FAQ, records, imprimer, mentions légales, éditions) with the preview URL, for their approval before cutover.
- [ ] **Step 2: Write the DNS cutover checklist** in `docs/` — verify preview green, back up WordPress, lower DNS TTL, point `championnatavionpapier.fr` to the Worker (custom domain), keep WP reachable at a temp subdomain for rollback, re-check redirects on the live domain, submit sitemap in Search Console, watch the `/tuto-avion-en-papier-facile-planeur/` CTR.
- [ ] **Step 3: Update `CHANGELOG.md` + `README.md`.**
- [ ] **Step 4: Push branch, open a non-draft PR** to `main` (do NOT merge — await explicit user approval). Tag reviewers. Use the ship-it skill.
- [ ] **Step 5: STOP.** DNS cutover happens only after the user approves the PR and the content review.

---

## Self-Review (completed by plan author)

**Spec coverage:** IA/URLs → Tasks 10–17; content model/CMS → Tasks 4, 21, 22; SEO/perf/infra → Tasks 8, 18–20, 23; design direction → Tasks 3, 6, 7; media → Task 5; redirects → Task 18; new SEO content → Tasks 12, 14, 16; data-conflict fixes → Tasks 10, 11 (reglages single source). All spec sections mapped.

**Placeholder scan:** No "TBD"/"handle edge cases" left as work items. The two intentional human-input points (Frutiger license confirmation in Task 3; GitHub OAuth app + secrets + Cloudflare Git connection + legal entity details in Tasks 3/17/22/23) are external actions, documented explicitly, not code placeholders. `REPLACE_WITH_CF_ANALYTICS_TOKEN` is a named injection point resolved in Task 23. The `--color-orange` value has an explicit correction note in Task 3 Step 2.

**Type consistency:** Collection field names in `content.config.ts` (Task 4) are reused verbatim by CMS config (Task 21) and page tasks. Schema builder signatures (`buildEvent/buildHowTo/buildFaq`, Task 8) match their `.astro` wrappers and test. Component prop names (Task 7) match consuming layouts (Task 9).

**Known risks to surface at execution:** (1) preserving flat legacy tutorial/article URLs requires explicit slug→route mapping (Tasks 13, 15) — collision risk with top-level pages, mitigated by an explicit allow-list in `getStaticPaths`; (2) Sveltia `image` widget paths must agree with `astro:assets` import paths (Task 21 Step 2); (3) Frutiger web-font licensing.
