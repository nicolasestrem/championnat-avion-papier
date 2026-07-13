# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
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

### Changed
- Font resolved to self-hosted Fira Sans after confirming Frutiger is not web-licensed.

### Notes / outstanding before go-live
- 6 tutorials use a placeholder featured image and lack per-step photos (Nakamura & Flèche
  have real photos); Lighthouse, browser QA, live 301 tests, CMS OAuth, and Cloudflare
  deploy remain manual steps. See `docs/CONTENT-REVIEW.md`.
