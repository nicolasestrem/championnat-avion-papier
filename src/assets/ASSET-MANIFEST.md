# Asset Manifest — Championnat Avion Papier (Astro migration)

Curated media contract for downstream content/page tasks. Every path below is a **real
file present in the repo** (copied from `uploads/` originals, WordPress `-WIDTHxHEIGHT`
thumbnail variants excluded). Import images into `.astro`/content via the `src/assets/...`
path (processed by `astro:assets`); reference PDFs/video via the public `/files/...` URL.

- Image import base for content frontmatter/JSON: paths are **relative to the entry file**.
  From `src/content/tutoriels/*.md` → `../../assets/tutoriels/...`.
  From `src/content/editions/*.json` → `../../assets/editions/...`.
- In `.astro` components import with a path relative to the component, e.g.
  `import img from '../../assets/event/flyer-2026.webp'`.

## Tutoriels — `src/assets/tutoriels/`

### Planeur Nakamura (post `/plier-avion-en-papier-nakamura/`, 9 étapes)
Mapping established from the Nakamura post body (steps 6, 8, 9 have no photo in the source).

| Asset path | Rôle / étape | Description FR |
| --- | --- | --- |
| `src/assets/tutoriels/nakamura-intro.avif` | Image à la une / intro | Le Planeur Nakamura terminé, présentation (ex-`brocnxbrocnxbroc_result`) |
| `src/assets/tutoriels/nakamura-etape-1.avif` | Étape 1 | Le pli central en longueur sur feuille A4 (ex-`jyv7t7…_result`) |
| `src/assets/tutoriels/nakamura-etape-2.avif` | Étape 2 | Plier le bord supérieur vers le bas sur ~6 cm (ex-`w4vbb6…_result`) |
| `src/assets/tutoriels/nakamura-etape-3.avif` | Étape 3 | Rabattre les coins du nez vers la ligne centrale (ex-`x0t9sk…_result`) |
| `src/assets/tutoriels/nakamura-etape-4.avif` | Étape 4 | Replier la pointe vers le haut — premier verrou Nakamura (ex-`yo3ksl…_result`) |
| `src/assets/tutoriels/nakamura-etape-5.avif` | Étape 5 | Double pli des bords, verrou du nez visible (ex-`vmtkpc…_result`) |
| `src/assets/tutoriels/nakamura-etape-7.avif` | Étape 7 | Former les ailes larges et plates pour le vol plané (ex-`xniz0p…_result`) |
| `src/assets/tutoriels/nakamura-termine.avif` | Fin / résultat | Le Planeur Nakamura terminé, avion A4 pour la durée de vol (ex-`wbgk0q…_result`) |

### Flèche Classique (post `/plier-avion-en-papier-fleche-classique/`, 7 étapes)
Source images `etape_1..8_result.avif`. In the post body: `etape_1` = image d'intro / à la une ;
étape 1 illustrée par `etape_2`, étape 2 → `etape_3`, étape 3 → `etape_4`, étape 4 → `etape_5`,
étape 5 → `etape_6`, étape 7 → `etape_8` (étape 6 sans photo). All 8 are copied for flexibility.

| Asset path | Rôle | Description FR |
| --- | --- | --- |
| `src/assets/tutoriels/fleche-etape-1.avif` | Intro / à la une | Illustration d'intro de la Flèche Classique |
| `src/assets/tutoriels/fleche-etape-2.avif` | Illustre étape 1 | Le pli central (colonne vertébrale) |
| `src/assets/tutoriels/fleche-etape-3.avif` | Illustre étape 2 | Coins supérieurs repliés — naissance du nez |
| `src/assets/tutoriels/fleche-etape-4.avif` | Illustre étape 3 | Double pli du nez — la flèche prend forme |
| `src/assets/tutoriels/fleche-etape-5.avif` | Illustre étape 4 | Grand pli longitudinal — le fuselage |
| `src/assets/tutoriels/fleche-etape-6.avif` | Illustre étape 5 | Formation des ailes |
| `src/assets/tutoriels/fleche-etape-7.avif` | (réserve) | Vue intermédiaire du pliage |
| `src/assets/tutoriels/fleche-etape-8.avif` | Illustre étape 7 | Réglages fins des élevons + vol test |

## Événement — `src/assets/event/`

| Asset path | Description FR | Page(s) cible(s) |
| --- | --- | --- |
| `src/assets/event/flyer-2026.webp` | Flyer officiel du Championnat 2026 (format portrait) | Accueil, Contact/FAQ, OG |
| `src/assets/event/pompiers-solidaires-rotary.avif` | Bandeau Pompiers Solidaires Développement × Rotary Mérignac | Accueil (bloc cause), Presse |
| `src/assets/event/journee-championnat-type.png` | Illustration « journée de championnat type » (déroulé) | Activités, Contact/FAQ |
| `src/assets/event/logo-championnat.png` | Logo du Championnat (version paysage) | Header/Footer, OG fallback |

## Éditions (galeries) — `src/assets/editions/`

| Asset path | Description FR | Édition |
| --- | --- | --- |
| `src/assets/editions/edition-2023-01.avif` … `edition-2023-11.avif` | Photos de l'édition du 27 mai 2023 (ex-`IMG_59xx`, dates EXIF vérifiées ; les clichés 04 et 11 sont les variantes `_censored` avec visages d'enfants floutés) | `/editions/2023/` |
| `src/assets/editions/edition-2024-01.avif` … `edition-2024-05.avif` | Photos de l'édition du 1ᵉʳ juin 2024 (ex-`IMG_82xx/83xx`, dates EXIF vérifiées ; 03/04/05 sont les variantes `_censored`). Écartés : IMG_8304–8307 (cadrages têtes coupées), doublons de rafale | `/editions/2024/` |
| `src/assets/editions/edition-2025-01.avif` … `edition-2025-06.avif` | Photos de la compétition du 17 mai 2025 à Mérignac (lancers, participants, ambiance) — 6 clichés (ex-`PXL_20250517_*_result`) | `/editions/2025/` |
| `src/assets/editions/edition-2026-01.avif` … `edition-2026-07.avif` | Photos de l'édition du 13 juin 2026 (ex-`WhatsApp-Image-2026-06-13-*_result`) — 7 clichés dont stand Pompiers Solidaires, Alphajet, finales et cérémonie au gymnase | `/editions/2026/` |

## Presse — `src/assets/press/`

| Asset path | Description FR | Page |
| --- | --- | --- |
| `src/assets/press/communique-2026-apercu.jpg` | Aperçu (page 1) du communiqué de presse 2026 | `/presse/` |

## Placeholder — `src/assets/`

| Asset path | Description FR | Usage |
| --- | --- | --- |
| `src/assets/placeholder.avif` | Logo paysage du Championnat, utilisé comme image de repli valide dans les seeds | Seeds tutoriels/actualités (à remplacer) |

## Fichiers publics — `public/files/` (référencés par URL `/files/...`)

| URL | Description FR | Page |
| --- | --- | --- |
| `/files/paper-plane-kit.pdf` | Kit avion en papier imprimable (gabarit) | `/avion-papier-a-imprimer/` |
| `/files/communique-presse-2026.pdf` | Communiqué de presse officiel 2026 | `/presse/`, Contact/FAQ |
| `/files/teaser-10s.mp4` | Teaser vidéo de 10 s (auto-hébergé) | Accueil / Activités |

---

## IMPORTANT — sources manquantes dans `uploads/` (à connaître pour les tâches aval)

Ces médias sont **référencés dans l'export de contenu mais ABSENTS de `uploads/`** (seules des
variantes miniatures dimensionnées, ou rien du tout, existent). Prévoir un remplacement, une
recréation, ou l'omission :

- **Infographie « Activités pour les enfants »** (`Activites-pour-les-enfants*.webp`) : introuvable.
  Bloc « Que peuvent faire les enfants » présent sur l'accueil ET l'activités — à dédupliquer
  (garder sur UNE seule page) ; l'infographie devra être recréée ou remplacée.
- **Images de l'article STEM** (`2025/03/japon-historique…`, `salle-de-classe…`,
  `avions-en-papier-futuristiques…`) : le dossier `uploads/2025/03/` est **vide**. L'article
  `/histoire-avions-papier/` (Task 15) n'a aucune image d'origine disponible.
- **Image « Le Faucon »** (`Avion-Papier-Faucon-png.avif`) et **`comment-plier-un-avion-en-papier.avif`**
  (tuto `/plier-un-avion-en-papier-3/`) : introuvables → ces tutoriels fins seront de toute façon
  réécrits avec de nouvelles photos (Task 14).
- **Photos d'activités** `championnat-avions-en-papier-56.avif`, `championnat-de-paper-planes-en-59.avif`
  (page activités) : introuvables.
- **Communiqué de presse 2025** (`Communique-de-presse-Championnat-Avion-Papier-2025.pdf`) :
  introuvable ; seul le **2026** est disponible.
- **`helloassochampionnat3.avif`** : seules des variantes dimensionnées existent, pas d'original
  → non copié.

Note : plusieurs images « DFCI / feux de forêt » existent dans `uploads/2025/04/` (ex-cause) — ne
les utiliser QUE dans un contexte historique 2023/2024, jamais comme cause actuelle (= Pompiers
Solidaires).

## Notes techniques

- Toutes les images ci-dessus sont des **originaux** (pas de suffixe `-WIDTHxHEIGHT`), optimisées à
  la volée par `astro:assets` (sharp vérifié : sortie AVIF/WebP responsive).
- `uploads/` reste en place (gitignoré) ; il sera archivé sous `_source/uploads-original/` lors d'une
  étape ultérieure de la Task 5.
