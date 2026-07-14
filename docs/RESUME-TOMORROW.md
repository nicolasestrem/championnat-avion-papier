# Resume prompt — WordPress → Astro migration (championnatavionpapier.fr)

Paste the block below into a new Claude Code session to pick up where we left off.

---

We're migrating **championnatavionpapier.fr** from WordPress to a static **Astro 7** site
(Tailwind v4, self-hosted Fira Sans, Sveltia CMS, Cloudflare Workers static assets). The
build is done and verified; we're in the review/deploy phase. Read `docs/CONTENT-REVIEW.md`,
`docs/DEPLOYMENT.md`, and `CHANGELOG.md` first for full context, then the plan at
`docs/superpowers/plans/2026-07-14-wordpress-to-astro-migration.md`.

## Where things stand
- Branch **`migrate-wordpress-to-astro`**, latest commit **`1f674d6`**, open as **PR #1**
  (https://github.com/nicolasestrem/championnat-avion-papier/pull/1). NOT merged.
- Verified green: `npx vitest run` 6/6, `astro check` 0 errors/0 warnings/94 (pre-existing)
  hints, `npm run build` 26 pages, `npm run check:links` 0 broken. Use `npm run verify`.
- Site facts live in `src/content/reglages/reglages.json` (event Sat 13 June 2026, Complexe
  sportif Daniel Colombier, Mérignac; sélections 11h–15h, finales 15h30; 8 €/entrée libre;
  bénéficiaire Pompiers Solidaires). Content is French only.
- All PR bot comments (Gemini + Codex) have been triaged/fixed; 2 were false positives
  (astro@^7.0.9 IS latest; nested reglages.json is the correct file()-loader shape).

## Ground rules (mine — enforce them)
- Never commit to `main`; never merge PR #1 without my explicit approval. Work on the branch.
- Never mark anything done without pasting the verbatim verification output (tests/build/lint).
- No stubbing, hardcoding, or placeholder values to fake success. If blocked, stop and ask.
- Update `CHANGELOG.md` and the relevant docs with every change.

## Outstanding work (roughly priority order — confirm with me before big moves)
1. **Cloudflare deploy is blocked on one setting**: in Workers → the `championnat-avion-papier`
   worker → Build configuration, **Build command is empty** → builds fail with
   `assets.directory ./dist does not exist`. Set **Build command = `npm run build`**, save,
   retry. (Optional: set Version command = `npx wrangler versions upload` for non-prod
   preview versions.) Then confirm the `*.workers.dev` preview renders. I can pull build logs
   via the Cloudflare MCP tools (worker id `623ac9662ca04449ac141f170c8629b6`).
2. **Cloudflare Web Analytics**: `src/layouts/BaseLayout.astro` has
   `REPLACE_WITH_CF_ANALYTICS_TOKEN` — I'll create a token or we remove the beacon.
3. **CMS (Sveltia) live setup**: create a GitHub OAuth App, deploy `workers/sveltia-cms-auth`
   (secrets GITHUB_CLIENT_ID/SECRET), set `base_url` in `public/admin/config.yml`, add Rotary
   editors as repo collaborators. **Then do a real editor round-trip with an image upload** —
   this is the ONLY way to confirm the entry-relative `media_folder`/`public_folder` change
   in `config.yml` actually produces `image()`-resolvable paths (couldn't verify at build time).
4. **Content review** (`docs/CONTENT-REVIEW.md`): I need to read/approve the rewritten French
   copy — especially folding accuracy on the planeur (#1 traffic page) and faucon tutorials.
5. **Tutorial images**: planeur + classique now use real WordPress images; **faucon, rond,
   lanceur, intercepteur** use a generic on-brand illustration (`tutoriel-generique.avif`, via
   `scripts/make-tutorial-fallback.mjs`). Decide: shoot real per-step photos, commission art,
   or ship generic.
6. **`/mentions-legales/`**: legal entity/host/publication-director fields are a `TODO` — I'll
   provide them.
7. **"rond" slug**: currently `/avion-papier-rond/` vs planned `/avion-en-papier-rond/` — pick one.
8. **Manual QA before cutover**: Lighthouse mobile (target ≥95/SEO 100), browser QA at 390px
   & 1280px on all 26 routes, live 301 redirect tests on the preview, Google Rich Results
   validation (Event/HowTo/FAQPage). Playwright + Cloudflare MCP tools are available.
9. **DNS cutover** — separate step, only on my explicit go-ahead (checklist in DEPLOYMENT.md).

Start by re-verifying the build is still green, then ask me which of the above I want to tackle
first this morning.
