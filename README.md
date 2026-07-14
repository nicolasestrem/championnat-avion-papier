# championnatavionpapier.fr

Site officiel du **Championnat du Monde de Lancer d'Avions en Papier** (Mérignac, au profit des Pompiers Solidaires). Site statique **Astro 5**, éditable via **Sveltia CMS**, hébergé sur **Cloudflare Workers**. Il remplace l'ancien site WordPress/Elementor.

## Stack

- **Astro 5** (sortie statique, zéro JS par défaut) · **Tailwind CSS v4** · **Fira Sans** auto-hébergée (`@fontsource`)
- Contenu en **content collections** (Markdown/JSON validés par Zod) — voir `src/content.config.ts`
- Images via `astro:assets` · SEO : sitemap, JSON-LD (Event/HowTo/FAQPage/Organization/BreadcrumbList), carte de redirections `public/_redirects`
- CMS **Sveltia** sur `/admin/` (git-based : chaque enregistrement = commit → build Cloudflare)

## Développement

```bash
npm install
npm run dev      # serveur local
npm run build    # build de production → dist/
npm run verify   # astro check + build + vérif des liens internes
npm run check:links
```

## Structure

- `src/content/` — tout le contenu éditable (reglages, tutoriels, actualités, éditions, sponsors, faq, records, pages)
- `src/components/` — `seo/` (JSON-LD, head), `layout/` (header/footer/nav), `ui/` (kit visuel)
- `src/pages/` — routes (URL conservées depuis WordPress ; voir `public/_redirects` pour les 301)
- `workers/sveltia-cms-auth/` — Worker OAuth GitHub pour le CMS
- `public/admin/` — configuration Sveltia CMS
- `_source/` — exports WordPress d'origine (référence, non buildé)
- `docs/` — spec, plan d'implémentation, **DEPLOYMENT.md**, **CONTENT-REVIEW.md**

## Mise en ligne

Voir **`docs/DEPLOYMENT.md`** (déploiement Cloudflare, OAuth CMS, bascule DNS) et **`docs/CONTENT-REVIEW.md`** (contenu à relire avant la mise en ligne).
