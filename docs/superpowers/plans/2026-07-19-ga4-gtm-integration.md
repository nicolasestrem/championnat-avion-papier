# GA4 and Google Tag Manager Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install direct GA4 tracking with `G-EHTVL72LRY` and Google Tag Manager container `GTM-N59XNT8X` on every public Astro-rendered page, with a build-enforced no-duplication contract.

**Architecture:** `src/layouts/BaseLayout.astro` is the single runtime insertion point: GTM and GA4 load at the start of `<head>`, and the GTM fallback iframe is the first child of `<body>`. A dependency-free Node checker inspects every generated public HTML file, excludes the standalone Sveltia CMS admin page from required tag presence, and becomes part of `npm run verify`.

**Tech Stack:** Astro 7 static output, Node.js 22.12+, npm scripts, dependency-free ESM verification script, Vitest 4.

## Global Constraints

- GA4 measurement ID is exactly `G-EHTVL72LRY`.
- Google Tag Manager container ID is exactly `GTM-N59XNT8X`.
- The direct GA4 configuration is the only GA4 owner; do not add a GA4 tag inside GTM.
- The published GTM container was empty (`"tags":[]`) when inspected on 2026-07-19.
- All public site content remains French-only; technical documentation may follow the repository's existing language.
- `/admin/` remains untagged because it is a standalone Sveltia CMS page copied from `public/admin/`.
- Keep AdSense and Cloudflare Web Analytics unchanged.
- Consent-management implementation remains outside this change; document the known EU consent requirement.
- Do not add dependencies.
- Do not stage or modify the existing untracked `.agents/`, `.codex/`, or root `AGENTS.md` files.

---

## File Map

- Create `scripts/check-analytics-tags.mjs`: enforce the rendered GA4/GTM contract across generated HTML.
- Modify `package.json`: expose `check:analytics` and add it to the canonical `verify` gate.
- Modify `src/layouts/BaseLayout.astro`: install both head loaders/configuration and the GTM body fallback.
- Modify `docs/DEPLOYMENT.md`: document identifiers, ownership, duplicate-event risk, verification, and consent boundary.
- Modify `CHANGELOG.md`: summarize the site-wide analytics integration and build gate.

### Task 1: Build-Enforced Analytics Contract and Runtime Integration

**Files:**
- Create: `scripts/check-analytics-tags.mjs`
- Modify: `package.json`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: static HTML emitted under `dist/` by `npm run build`.
- Produces: `npm run check:analytics`, exiting `0` only when every applicable HTML file contains the approved tags exactly once and in the approved positions.

- [ ] **Step 1: Create the failing build-output checker**

Create `scripts/check-analytics-tags.mjs` with this complete content:

```js
// Verifies that every public Astro-rendered HTML page contains the approved
// GA4 and Google Tag Manager snippets exactly once. The standalone Sveltia
// CMS admin page is intentionally excluded from required tag presence.
// Usage: node scripts/check-analytics-tags.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ADMIN_HTML = 'admin/index.html';
const GA4_ID = 'G-EHTVL72LRY';
const GTM_ID = 'GTM-N59XNT8X';
const GA4_LOADER = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
const GA4_CONFIG = `gtag('config', '${GA4_ID}')`;
const GTM_LOADER_PREFIX = 'https://www.googletagmanager.com/gtm.js?id=';
const GTM_FALLBACK = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(2);
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function relativeHtmlPath(file) {
  return relative(DIST, file).split(sep).join('/');
}

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'));
const publicHtmlFiles = htmlFiles.filter((file) => relativeHtmlPath(file) !== ADMIN_HTML);
const errors = [];

if (publicHtmlFiles.length === 0) {
  errors.push('dist/: no public HTML files discovered');
}

for (const file of publicHtmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = relativeHtmlPath(file);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];

  if (head === undefined) {
    errors.push(`${page}: missing <head>`);
  } else {
    if (countOccurrences(head, GTM_LOADER_PREFIX) !== 1) {
      errors.push(`${page}: expected one GTM head loader`);
    }
    if (countOccurrences(head, GA4_LOADER) !== 1) {
      errors.push(`${page}: expected one GA4 loader`);
    }
    const gtmIndex = head.indexOf(GTM_LOADER_PREFIX);
    const ga4Index = head.indexOf(GA4_LOADER);
    if (gtmIndex >= 0 && ga4Index >= 0 && gtmIndex > ga4Index) {
      errors.push(`${page}: GTM loader must precede GA4 loader`);
    }
  }

  if (body === undefined) {
    errors.push(`${page}: missing <body>`);
  } else {
    const fallbackPattern = new RegExp(
      `^\\s*<noscript>\\s*<iframe\\b[^>]*\\bsrc=["']${escapeRegex(GTM_FALLBACK)}["'][^>]*>`,
      'i',
    );
    if (!fallbackPattern.test(body)) {
      errors.push(`${page}: GTM fallback must be the first body child`);
    }
  }

  if (countOccurrences(html, GA4_CONFIG) !== 1) {
    errors.push(`${page}: expected one GA4 config call`);
  }
  if (countOccurrences(html, GTM_FALLBACK) !== 1) {
    errors.push(`${page}: expected one GTM fallback URL`);
  }
  if (countOccurrences(html, GA4_ID) !== 2) {
    errors.push(`${page}: expected GA4 ID exactly twice`);
  }
  if (countOccurrences(html, GTM_ID) !== 2) {
    errors.push(`${page}: expected GTM ID exactly twice`);
  }
}

const adminFile = htmlFiles.find((file) => relativeHtmlPath(file) === ADMIN_HTML);
if (adminFile) {
  const adminHtml = readFileSync(adminFile, 'utf8');
  if (adminHtml.includes(GA4_ID) || adminHtml.includes(GTM_ID)) {
    errors.push(`${ADMIN_HTML}: analytics identifiers must remain absent`);
  }
}

console.log(`Checked ${publicHtmlFiles.length} public HTML files.`);
if (errors.length === 0) {
  console.log('OK — GA4 and GTM tags are present exactly once on every public page.');
  process.exit(0);
}

console.error(`ANALYTICS TAG ERRORS (${errors.length}):`);
for (const error of errors) console.error(`  ${error}`);
process.exit(1);
```

- [ ] **Step 2: Add the focused command and canonical gate**

Change the `scripts` block in `package.json` to:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "check:links": "node scripts/check-links.mjs",
  "check:analytics": "node scripts/check-analytics-tags.mjs",
  "verify": "astro check && astro build && node scripts/check-links.mjs && node scripts/check-analytics-tags.mjs"
}
```

- [ ] **Step 3: Run the focused check and verify RED**

Run:

```powershell
npm run build
npm run check:analytics
```

Expected: `npm run build` exits `0`; `npm run check:analytics` exits `1`, prints
`ANALYTICS TAG ERRORS`, and reports the missing GTM/GA4 assertions for public pages.
The failure must be caused by the absent tags, not by a script syntax error.

- [ ] **Step 4: Add the minimal shared-layout implementation**

Replace the document shell in `src/layouts/BaseLayout.astro` with this content while
leaving the existing frontmatter imports and props unchanged:

```astro
<!doctype html>
<html lang="fr">
  <head>
    <script is:inline>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-N59XNT8X');
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-EHTVL72LRY"></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-EHTVL72LRY');
    </script>
    <BaseHead {title} {description} {image} {canonical} {noindex} />
    <slot name="head" />
  </head>
  <body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N59XNT8X"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <Header />
    <main><slot /></main>
    <Footer />
    <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token":"9639d2620d9c47999f9498cf338a5330"}`}></script>
  </body>
</html>
```

- [ ] **Step 5: Rebuild and verify GREEN**

Run:

```powershell
npm run build
npm run check:analytics
```

Expected final lines:

```text
Checked 28 public HTML files.
OK — GA4 and GTM tags are present exactly once on every public page.
```

If the generated page count legitimately changes, the first line may differ; the `OK`
line and exit code `0` are mandatory.

- [ ] **Step 6: Run focused unit tests and inspect the implementation diff**

Run:

```powershell
npx vitest run
git diff --check
git diff -- scripts/check-analytics-tags.mjs package.json src/layouts/BaseLayout.astro
```

Expected: all Vitest tests pass, `git diff --check` emits no errors, and the diff is
limited to the checker, package scripts, and shared layout described above.

- [ ] **Step 7: Commit the tested runtime contract**

```powershell
git add -- scripts/check-analytics-tags.mjs package.json src/layouts/BaseLayout.astro
git commit -m "feat(analytics): add GA4 and GTM site-wide"
```

### Task 2: Deployment and Maintenance Documentation

**Files:**
- Modify: `docs/DEPLOYMENT.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: the tag ownership and verification behavior implemented by Task 1.
- Produces: an operational record that prevents a future GTM configuration from duplicating direct GA4 events.

- [ ] **Step 1: Add the deployment section**

Append this section after the current AdSense section in `docs/DEPLOYMENT.md`:

```markdown
## 7. Google Analytics 4 et Google Tag Manager

**GA4** et **Google Tag Manager** sont chargés sur toutes les pages publiques via
`src/layouts/BaseLayout.astro` :

- mesure GA4 directe : `G-EHTVL72LRY` ;
- conteneur GTM : `GTM-N59XNT8X` ;
- `/admin/` reste exclu, car Sveltia CMS est une page autonome copiée depuis `public/`.

Le conteneur GTM publié a été contrôlé le 19/07/2026 et ne contenait aucun tag
(`"tags":[]`). La configuration GA4 directe est donc l'unique source des pages vues.
Si `G-EHTVL72LRY` est ajouté ultérieurement dans GTM, il faut retirer dans la même
version le chargeur et l'appel `gtag('config', 'G-EHTVL72LRY')` de `BaseLayout.astro`
afin d'éviter les événements en double.

Le contrôle `npm run check:analytics`, inclus dans `npm run verify`, inspecte chaque
page HTML publique générée et valide les identifiants, le nombre d'occurrences, l'ordre
des scripts et la position du fallback GTM.

⚠️ **Ce branchement ne met pas en place de CMP ni de Consent Mode.** Les exigences de
consentement UE/EEE doivent être traitées avec la lacune déjà documentée pour AdSense
avant l'utilisation en production.
```

- [ ] **Step 2: Add the changelog entry**

Add this item at the top of `CHANGELOG.md` → `## [Unreleased]` → `### Added`:

```markdown
- **Google Analytics 4 + Google Tag Manager** wired site-wide through
  `src/layouts/BaseLayout.astro` using GA4 measurement ID `G-EHTVL72LRY` and GTM
  container `GTM-N59XNT8X`. The build-enforced `check:analytics` gate verifies exact
  tag counts, ordering, body fallback placement, and intentional `/admin/` exclusion.
  Direct GA4 remains the single analytics owner while the published GTM container is
  empty; CMP/Consent Mode implementation remains separately tracked.
```

- [ ] **Step 3: Verify documentation consistency**

Run:

```powershell
rg -n "G-EHTVL72LRY|GTM-N59XNT8X|check:analytics|événements en double|Consent Mode" docs/DEPLOYMENT.md CHANGELOG.md
git diff --check
git diff -- docs/DEPLOYMENT.md CHANGELOG.md
```

Expected: both IDs and `check:analytics` appear in deployment documentation and the
changelog; the duplicate-event and consent warnings appear in `docs/DEPLOYMENT.md`;
`git diff --check` emits no errors.

- [ ] **Step 4: Commit the documentation**

```powershell
git add -- docs/DEPLOYMENT.md CHANGELOG.md
git commit -m "docs: document GA4 and GTM operations"
```

### Task 3: Full Verification and Completion Audit

**Files:**
- Verify only: all files changed by Tasks 1 and 2 plus generated `dist/` output.

**Interfaces:**
- Consumes: committed runtime integration, checker, package gate, and documentation.
- Produces: fresh evidence that the complete objective and repository gates are satisfied.

- [ ] **Step 1: Run the complete unit-test suite**

Run:

```powershell
npx vitest run
```

Expected: all test files and tests pass with exit code `0` and no test failures.

- [ ] **Step 2: Run the canonical repository gate**

Run:

```powershell
npm run verify
```

Expected: Astro diagnostics report no errors, the static build completes, link checking
prints `OK — no broken internal links.`, analytics checking prints
`OK — GA4 and GTM tags are present exactly once on every public page.`, and the command
exits `0`.

- [ ] **Step 3: Audit the built output and repository state**

Run:

```powershell
npm run check:analytics
git diff --check
git status --short
git log -4 --oneline
```

Expected:

- `check:analytics` passes against the fresh build;
- `git diff --check` emits no output;
- only the user's pre-existing untracked `.agents/`, `.codex/`, and root `AGENTS.md`
  entries remain in `git status --short`;
- the branch history contains the design commits and the two implementation commits;
- no merge, push, deployment, or production GTM publication has occurred.

- [ ] **Step 4: Review every requirement against authoritative evidence**

Confirm all of the following from the fresh command output and committed diff:

- every public Astro-generated HTML page contains direct GA4 `G-EHTVL72LRY` exactly
  once as a loader and once as a config call;
- every public Astro-generated HTML page contains GTM `GTM-N59XNT8X` exactly once in
  the head bootstrap and once in the first-body-child fallback;
- GTM precedes GA4 in `<head>`;
- `/admin/` contains neither identifier;
- direct GA4 remains the only configured GA4 owner;
- AdSense and Cloudflare Web Analytics remain present and unchanged;
- documentation and changelog describe operations, duplication risk, consent boundary,
  and verification command;
- the canonical verification gate and Vitest suite both pass.
