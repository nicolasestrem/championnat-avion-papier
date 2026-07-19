# AdSense Integration — Design

**Date:** 2026-07-19
**Status:** Approved

## Goal

Wire Google AdSense (Auto Ads) across the site so ads can serve on all pages, using the
account snippet and `ads.txt` line provided by Google AdSense for this site
(`ca-pub-9063907623690482`).

## Scope

- Site-wide Auto Ads only. No manual `<ins class="adsbygoogle">` ad units in specific
  page slots — Google's algorithm decides ad placement automatically.
- No cookie-consent / CMP work. The user is handling GDPR consent gating separately;
  this change only wires the raw AdSense loader and `ads.txt`, matching the same
  fire-and-forget pattern already used for Cloudflare Web Analytics
  (`BaseLayout.astro:19`).
- Client ID is hardcoded (not an env var), consistent with how the Web Analytics
  beacon token is hardcoded today.

## Changes

1. **`src/components/seo/BaseHead.astro`** — add the AdSense loader `<script>` inside
   `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9063907623690482"
        crossorigin="anonymous"></script>
   ```
   `BaseHead` is included by all four layouts (`BaseLayout`, and transitively
   `PageLayout`/`ArticleLayout`/`TutorialLayout`, plus `404.astro`), so this single
   insertion point covers all 17 page routes under `src/pages/`.

2. **`public/ads.txt`** (new file) — served at the site root the same way
   `public/robots.txt` is:
   ```
   google.com, pub-9063907623690482, DIRECT, f08c47fec0942fa0
   ```

3. **`docs/DEPLOYMENT.md`** — short note recording that AdSense is wired site-wide via
   `BaseHead.astro`, the client ID in use, and that consent-gating is a known,
   deliberately out-of-scope gap (handled elsewhere), so it doesn't read as an
   oversight later.

4. **`CHANGELOG.md`** — entry under `[Unreleased] / Added`.

## Out of scope

- Cookie consent banner / CMP (explicitly deferred by the user).
- Manual ad unit placement in specific page regions.
- Environment-variable-based client ID configuration.

## Verification

`npm run verify` (astro check + astro build + check:links). The AdSense script is a
static inline `<script>` tag and `ads.txt` is a static text file — neither touches
Zod content schemas or internal links, so `verify` is expected to pass unchanged.
Paste the actual command output before marking this done.
