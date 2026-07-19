---
name: new-tutorial
description: Scaffold a new paper-plane tutorial content file with schema-valid frontmatter for championnatavionpapier.fr. Use when creating a new tutoriel under src/content/tutoriels/.
disable-model-invocation: true
---

# new-tutorial

Scaffold a new tutorial (`src/content/tutoriels/<slug>.md`) whose frontmatter satisfies the `tutoriels` Zod schema in `src/content.config.ts`. A single invalid field fails `astro build`, so the generated file must validate exactly.

## Steps

1. **Get the slug.** Ask the user for the slug if not provided. The slug is the filename and becomes the live URL `/<slug>/`.
   - Must be kebab-case, French, no accents/emoji in the slug itself.
   - Must NOT collide with an existing top-level page directory (check `src/pages/`: `activites`, `avion-papier-a-imprimer`, `blog`, `contact-faq`, `editions`, `histoire-avions-papier`, `histoire-championnat-avion-papier`, `mentions-legales`, `politique-de-confidentialite`, `presse`, `records-avion-en-papier`, `ressources-avions-papier`, `sponsors`) or an existing tutorial file.

2. **Check for a replaced URL.** Ask if this tutorial replaces/supersedes an old URL (a former WordPress slug or a consolidated tutorial). If yes, add a line to `public/_redirects`:
   ```
   /old-slug/              /new-slug/              301
   ```
   Whitespace-aligned, both paths trailing-slashed. This is the step most easily forgotten — do not skip it.

3. **Write the file** at `src/content/tutoriels/<slug>.md` using the template below. Fill what the user provides; leave clearly-marked `TODO` placeholders for the rest so it's obvious what still needs real content. Every field shown (except the optional ones noted) is required by the schema.

4. **Verify.** Run `npx astro check` (or `npm run verify` for the full gate) and paste the output. Do not claim success without it — a schema violation only shows up here.

## Schema constraints (from src/content.config.ts)

- `difficulte`: one of `facile` | `intermediaire` | `avance` (exact strings).
- `typeVol`: one of `distance` | `duree` | `polyvalent`.
- `image`: relative path from the file, i.e. `../../assets/tutoriels/<file>` — the asset **must exist** or the build fails (`astro:assets`). Use an existing image or `../../assets/tutoriels/tutoriel-generique.avif` as a placeholder.
- `etapes[].image` / `etapes[].alt`: optional per step; if you give an `image`, give an `alt`.
- `materiel`: defaults to `['Une feuille A4']` if omitted.
- `faq`: array of `{ q, r }`; drives the FAQPage JSON-LD — include a few real Q&As for SEO.
- `datePublication`: required, `YYYY-MM-DD`. `dateMaj`: optional.
- `draft: true` keeps it out of the build (no page emitted, no URL) until ready.

## Template

```markdown
---
title: "TODO — titre H1 lisible (peut contenir accents et emoji)"
seoTitle: "TODO — titre pour l'onglet/Google (~60 car.)"
seoDescription: "TODO — méta description accrocheuse (~155 car.)"
difficulte: "facile"          # facile | intermediaire | avance
typeVol: "distance"           # distance | duree | polyvalent
dureePliage: "5 min"
image: "../../assets/tutoriels/tutoriel-generique.avif"
imageAlt: "TODO — description de l'image principale"
etapes:
  - texte: "TODO — étape 1, instruction claire et détaillée."
    image: "../../assets/tutoriels/tutoriel-generique.avif"   # optionnel
    alt: "TODO — description de l'étape 1"                     # requis si image
  - texte: "TODO — étape 2."
materiel:
  - "1 feuille A4 standard (80 g/m²)"
  - "Une surface plane et rigide"
faq:
  - q: "TODO — question fréquente ?"
    r: "TODO — réponse utile et complète."
tags:
  - "avion en papier"
  - "pliage"
datePublication: 2026-07-14
draft: true
---

TODO — corps optionnel de l'article (Markdown) rendu sous les étapes.
```

After writing, remind the user to flip `draft: false` when the content is final, and confirm the redirect line was added if this replaced an old URL.
