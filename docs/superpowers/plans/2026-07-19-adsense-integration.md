# AdSense Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Google AdSense (Auto Ads) site-wide via the shared `BaseHead.astro` partial, and publish the required `ads.txt`.

**Architecture:** Static Astro site — every page route renders through one of four layouts, all of which include `src/components/seo/BaseHead.astro` inside `<head>`. Adding the AdSense loader `<script>` there is a single insertion point that reaches all 17 page routes, matching how Cloudflare Web Analytics' beacon script already lives in one shared layout file (`src/layouts/BaseLayout.astro:19`).

**Tech Stack:** Astro 5, no new dependencies. Plain `<script>` tag and a static `ads.txt` text file (same pattern as `public/robots.txt`).

## Global Constraints

- Client ID is hardcoded as `ca-pub-9063907623690482` (per approved spec — not an env var).
- Auto Ads only — no manual `<ins class="adsbygoogle">` ad units in this change.
- No cookie-consent/CMP work — explicitly out of scope (handled by the user elsewhere).
- All user-facing content/docs stay in French, matching the rest of the repo (`docs/DEPLOYMENT.md`, `CHANGELOG.md` conventions).
- `npm run verify` (astro check + astro build + check:links) must pass before considering the work done — paste its actual output, no paraphrasing.

---

### Task 1: Add the AdSense loader script to BaseHead

**Files:**
- Modify: `src/components/seo/BaseHead.astro`

**Interfaces:**
- Consumes: nothing new — no prop changes to `BaseHead`.
- Produces: nothing consumed by other tasks; this is a self-contained markup addition.

- [ ] **Step 1: Add the script tag**

Edit `src/components/seo/BaseHead.astro`. Insert the AdSense loader as the last element before the closing `<slot />`, so the existing head elements (title, canonical, OG tags, favicon) are unaffected:

```astro
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9063907623690482"
     crossorigin="anonymous"></script>
<slot />
```

The full file after the edit:

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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9063907623690482"
     crossorigin="anonymous"></script>
<slot />
```

- [ ] **Step 2: Build and spot-check the output**

Run: `npm run build`
Expected: build succeeds (same page count as before — 27 pages per the last recorded build); no new errors.

Then check the script landed in the built HTML:

Run (bash): `grep -o 'pagead2.googlesyndication.com[^"]*' dist/index.html`
Expected output: `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9063907623690482`

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/BaseHead.astro
git commit -m "feat(seo): wire Google AdSense Auto Ads loader in BaseHead"
```

---

### Task 2: Publish ads.txt

**Files:**
- Create: `public/ads.txt`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by other tasks.

- [ ] **Step 1: Create the file**

Create `public/ads.txt` with exactly this content (one line, matches the value Google AdSense issued for this property):

```
google.com, pub-9063907623690482, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 2: Build and verify it's served from the root**

Run: `npm run build`
Expected: build succeeds.

Run (bash): `test -f dist/ads.txt && cat dist/ads.txt`
Expected output: `google.com, pub-9063907623690482, DIRECT, f08c47fec0942fa0`

- [ ] **Step 3: Commit**

```bash
git add public/ads.txt
git commit -m "feat(seo): add ads.txt for Google AdSense verification"
```

---

### Task 3: Document the change and update the changelog

**Files:**
- Modify: `docs/DEPLOYMENT.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Add a section to `docs/DEPLOYMENT.md`**

Insert a new section after "## 5. Rollback" (end of file), following the file's existing French tone and dated-status convention:

```markdown

## 6. AdSense

**Google AdSense (Auto Ads)** activé sur tout le site le 19/07/2026 : script chargeur
ajouté dans `src/components/seo/BaseHead.astro` (inclus par les 4 layouts, donc sur
les 17 routes de pages), identifiant client `ca-pub-9063907623690482`. `public/ads.txt`
publié à la racine avec la ligne fournie par Google (`google.com, pub-9063907623690482,
DIRECT, f08c47fec0942fa0`).

Placement automatique uniquement (Auto Ads) — aucun bloc publicitaire manuel.

⚠️ **Pas de bandeau de consentement cookies (RGPD) mis en place dans ce changement.**
La politique de consentement EU de Google impose un CMP avant de servir des annonces
(ou au minimum des annonces non personnalisées) aux visiteurs UE/EEE. C'est une lacune
connue, gérée séparément par le porteur du projet — pas un oubli.
```

- [ ] **Step 2: Add a CHANGELOG entry**

Edit `CHANGELOG.md`, adding a new bullet under `## [Unreleased]` → `### Added` (at the top of that list, above the F-16 tutorial entry):

```markdown
- **Google AdSense (Auto Ads)** wired site-wide via `src/components/seo/BaseHead.astro`
  (client `ca-pub-9063907623690482`), plus `public/ads.txt`. Auto Ads only — no manual
  ad slots. Cookie-consent/CMP gating for EU visitors is explicitly out of scope for
  this change (see `docs/DEPLOYMENT.md` §6).
```

- [ ] **Step 3: Commit**

```bash
git add docs/DEPLOYMENT.md CHANGELOG.md
git commit -m "docs: record AdSense integration in deployment notes and changelog"
```

---

### Task 4: Full verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Run the full gate**

Run: `npm run verify`
Expected: astro check reports 0 errors, `astro build` succeeds, `check:links` passes with no broken internal links.

- [ ] **Step 2: Paste the verbatim output**

Paste the full terminal output of `npm run verify` into the conversation before marking this plan complete — no summary or paraphrase, per project standing instructions.
