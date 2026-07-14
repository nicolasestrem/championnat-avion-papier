# Revue de contenu — à valider avant la mise en ligne

Tout le contenu français ci-dessous a été **rédigé/réécrit pour la migration** et doit être relu par vous avant la bascule DNS. Prévisualisez avec `npm run dev` puis ouvrez les URL.

> **14/07/2026** — une passe de vérification automatisée (faits, pliages, langue, dérive vs WordPress) a été effectuée : constats, corrections déjà appliquées et décisions en attente dans **[CONTENT-REVIEW-FINDINGS.md](./CONTENT-REVIEW-FINDINGS.md)**. À lire avant la relecture page par page.

## Pages à relire en priorité (contenu nouveau ou réécrit)

| Page | URL | Nature | À vérifier |
|---|---|---|---|
| Planeur (tuto) | `/tuto-avion-en-papier-facile-planeur/` | **Réécrit** ~120 → ~1 185 mots | Exactitude du pliage. C'est la page n°1 en trafic. |
| Le Faucon (tuto) | `/tuto-avion-en-papier-le-faucon/` | Réécrit ~100 → ~1 115 mots | Exactitude du pliage. |
| Avion rond (tuto) | `/avion-papier-rond/` | **Nouveau** | Exactitude ; **slug** : publié en `/avion-papier-rond/` (le plan prévoyait `/avion-en-papier-rond/` — à trancher). |
| Lanceur (tuto) | `/lanceur-avion-en-papier/` | **Nouveau** | Faisabilité/sécurité du lanceur décrit. |
| Intercepteur (tuto) | `/plier-avion-en-papier-intercepteur/` | **Réactivé** (brouillon WP) | Cohérence avec la série Flèche/Nakamura. |
| Classique (tuto) | `/plier-un-avion-en-papier-3/` | Réécrit | Exactitude. |
| FAQ (21 questions) | `/contact-faq/` | **Élargi** ~200 mots → 21 Q/R | Exactitude des infos pratiques (tarifs, horaires, accès). |
| Records | `/records-avion-en-papier/` | Nouveau | Exactitude des records/années/détenteurs. |
| À imprimer | `/avion-papier-a-imprimer/` | Nouveau | Le PDF proposé est le bon. |
| Éditions 2023/24/25/26 | `/editions/2026/` etc. | Nouveau | Participants, nations, faits marquants. **Galeries photos ajoutées le 14/07/2026** (2023 : 11 clichés, 2024 : 5, 2025 : 6, 2026 : 7) — trier sur la preview les photos à retirer (visages identifiables, selfie 2023 ; noter que `edition-2023-09/10` sont des captures Instagram avec texte incrusté). |
| Accueil — mosaïque photos | `/` | **Nouveau (14/07/2026)** | Section « Le Championnat en images » : 5 clichés (atelier 2023 en grand, pliage 2025, Alphajet 2026, drapeaux 2025, finales 2026), chacun cliquable vers sa page édition. Valider le choix des photos ; si un cliché est retiré d'une galerie, l'accueil doit suivre (voir `src/assets/ASSET-MANIFEST.md`). |
| Mentions légales | `/mentions-legales/` | Nouveau | **Entité juridique / adresse / directeur de publication à confirmer** (marqué d'un TODO dans le fichier). |
| Presse / Sponsors | `/presse/`, `/sponsors/` | Migré | Citations, liens et descriptifs des 13 partenaires. |

## Points à trancher / lacunes identifiées à la vérification

1. **Images d'illustration — premier passage effectué.** État actuel des visuels principaux (aucun tutoriel n'a de photos **par étape**, sauf Nakamura et Flèche Classique qui gardent leurs vraies photos d'étapes issues de WordPress) :
   - **Planeur** → `planeur-diagramme.png` : vrai schéma de pliage (6 vignettes) retrouvé dans les uploads WordPress. À valider.
   - **Classique** (`plier-un-avion-en-papier-3`) → `classique-modele.png` : vrai rendu d'un avion classique retrouvé dans les uploads. À valider.
   - **Faucon, Rond, Lanceur, Intercepteur** → `tutoriel-generique.avif` : illustration décorative sur-mesure (avion en papier blanc sur ciel bleu, aux couleurs de la marque). **Aucune photo source n'existe** pour ces 4 pliages. Décision restante : produire de vraies photos de pliage (idéalement par étape), commander des illustrations, ou conserver l'illustration générique. Le script de génération est `scripts/make-tutorial-fallback.mjs`.
2. **Slug « avion rond »** — publié en `/avion-papier-rond/` au lieu du `/avion-en-papier-rond/` prévu. Page neuve sans historique SEO : choisir le slug canonique définitif.
3. **Mentions légales** — les détails de l'entité juridique (éditeur, hébergeur, directeur de publication, adresse) sont à confirmer ; un `TODO` est laissé dans le fichier, aucune adresse n'a été inventée.
4. **Faits canoniques 2026** — vérifiez `src/content/reglages/reglages.json` : date (samedi 13 juin 2026), lieu (Complexe sportif Daniel Colombier), horaires (sélections 11h–15h, finales 15h30), tarifs (8 € / entrée libre), bénéficiaire (Pompiers Solidaires), URL HelloAsso.

## Vérifications techniques restantes (nécessitent navigateur/déploiement)

- Lighthouse mobile (Perf ≥ 95 / SEO 100 / a11y ≥ 95).
- QA navigateur à 390 px et 1280 px sur les 26 routes.
- Test 301 en conditions réelles (après déploiement preview).
- Validation Google Rich Results (Event / HowTo / FAQPage).
