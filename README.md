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

## Réglages de l'édition

La source de vérité est `src/content/reglages/reglages.json`, éditable dans
la collection **Réglages** de Sveltia CMS.

- `dateISO` et `dateFinISO` doivent inclure le fuseau horaire, par exemple
  `2026-06-13T11:00:00+02:00` et `2026-06-13T17:00:00+02:00`.
- `descriptionEvenement`, `adresseRue`, `codePostal` et `ville` alimentent le
  JSON-LD `Event`. Utiliser uniquement des informations publiées et vérifiées.
  L'image de l'événement provient du visuel de la page d'accueil.
- `inscriptionsOuvertes: false` masque les liens d'inscription courants, indique
  la clôture dans Google Agenda et omet les `offers` du JSON-LD. Les actualités
  historiques restent consultables. Ne réactiver ce champ que lorsque les
  inscriptions à l'édition concernée sont réellement ouvertes.
- Pour une nouvelle édition, mettre à jour ensemble les dates, le lieu, le
  descriptif, le flyer et l'URL HelloAsso. Ne pas déduire `performer` ou
  `offers.validFrom` d'une date de publication ou d'une information inconnue.

## Mise en ligne

Voir **`docs/DEPLOYMENT.md`** (déploiement Cloudflare, OAuth CMS, bascule DNS) et **`docs/CONTENT-REVIEW.md`** (contenu à relire avant la mise en ligne).
