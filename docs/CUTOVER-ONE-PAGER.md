# WordPress → Astro : the switch, one page ✈️

**Good news: the new site is ALREADY live on the production Worker.** The "switch" is just pointing the domain at it. Everything below is prep, 4 decisions, and a 30-minute flip.

## 🟢 Panic button (read once, then relax)

Rollback = Cloudflare dashboard → Worker → remove custom domain → restore the old DNS record. **Takes ~1 minute.** Nothing can be lost — the whole site lives in git.

---

## Phase 0 — Today (5 min)

- [ ] **Freeze WordPress.** No more edits on the old site — tell anyone who has access. *(2 min)*
- [ ] **Tell Claude "go"** on the repo fixes: 404 page + missing redirects (old sitemaps, `/feed/`, `/general/`, date archives). Claude codes, you just review the PR. *(1 min)*

## Phase 1 — Prep (spread over days · ~1½ h of you-time)

- [ ] **Back up WordPress**: DB dump + `wp-content` folder → copy it OFF the basement server. *(30 min)*
- [ ] **Review & merge the fixes PR** once it's green. *(15 min)*
- [ ] **CMS test on `/admin/`**: edit an entry, upload an image, save → the Cloudflare build must go green. This is the last unverified thing. *(15 min)*
- [ ] **Quick QA**: Lighthouse mobile on `/`, the planeur tuto, `/contact-faq/` + Google Rich Results test. *(20 min)*

## Phase 2 — Decisions (think while making coffee ☕)

| # | Decide | Suggested call |
|---|--------|---------|
| 1 | Mentions légales: directeur de publication + hébergeur (still TODO) | Only you can answer |
| 2 | 4 tutorials use a generic illustration — ship or wait for real photos? | **Ship now, swap later** |
| 3 | Read the rewritten planeur + faucon copy (`docs/CONTENT-REVIEW.md`) | 20 min — it's your #1 traffic page |
| 4 | Slug: keep `/avion-papier-rond/` or rename to `/avion-en-papier-rond/`? | **Keep as-is** (renaming costs a redirect) |

## Phase 3 — Switch day (~30 min · pick a calm morning)

- [ ] Cloudflare → Worker → **add custom domain** `championnatavionpapier.fr` *(5 min)*
- [ ] **Redirect rule**: `www.championnatavionpapier.fr/*` → apex, 301 *(5 min)*
- [ ] **Disable WordPress-era Cloudflare rules** if any exist: APO, page rules, cache rules *(5 min)*
- [ ] **Smoke test**: home · planeur tuto · `/admin/` login · `curl -I` two old URLs (expect 301) · `/sitemap-index.xml` *(10 min)*
- [ ] **Search Console**: submit `sitemap-index.xml` *(5 min)*

## Phase 4 — Aftercare (low effort)

- [ ] Day 1: Web Analytics data flowing?
- [ ] Weekly × 4: Search Console → new 404s? Each one = a one-line `_redirects` fix, ask Claude.
- [ ] ~1 month later: **shut down basement WordPress.** Final archive, close the tunnel. 🎉

---

## Facts (so your brain can stop double-checking)

- Production build from `main`: ✅ green (14 Jul, 10:04)
- 151 old URLs audited → **every traffic-bearing URL is covered**
- CMS commits to `main`, OAuth keeps working after the switch — verified
- Old WordPress stays reachable on your LAN for rollback; no need to expose it publicly
