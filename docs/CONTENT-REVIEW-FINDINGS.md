# Revue de contenu — constats détaillés (14/07/2026)

Résultats de la passe de vérification automatisée (4 revues parallèles : faits vs `reglages.json`, cohérence des pliages, langue française, dérive vs export WordPress `_source/`), chaque constat ayant été contre-vérifié avant d'être retenu. À lire **avant** votre relecture des pages prioritaires de `CONTENT-REVIEW.md`.

Légende : ✅ corrigé dans cette passe · ⚠️ décision à prendre par vous · ℹ️ pour information.

## ✅ Corrections appliquées (commit de cette passe)

1. **Flèche Classique — images d'étapes remappées** (`src/content/tutoriels/plier-avion-en-papier-fleche-classique.md`). Les diagrammes étaient mélangés (l'étape 1 « pli central » affichait le double pli du nez ; l'étape 3 affichait le pli d'aile « 2,5 cm »…). Vérifié visuellement image par image. Nouveau mapping : étape 1 → `fleche-etape-3` (pli central), étape 3 → `fleche-etape-2` (double pli), étape 4 → `fleche-etape-5` (inchangé), étape 5 → `fleche-etape-4` (pli d'aile 2,5 cm), étape 6 → `fleche-etape-7` (ouverture/dièdre, était sans image), étape 7 → `fleche-etape-8` (élevons, inchangé). L'étape 2 (premiers coins) n'a **aucun diagramme correspondant** dans les assets → reste sans image (voir ⚠️ n° 10). **À valider à l'œil sur la preview.**
2. **Flèche — intro corrigée** : « Les cinq étapes illustrées… » ne correspondait pas à la réalité → « Les premières étapes construisent la structure… ».
3. **Nakamura — intro corrigée** : « les neuf étapes illustrées » alors que les étapes 6 et 8 n'ont pas d'image → « les neuf étapes ci-dessus ».
4. **Intercepteur — `typeVol` passé de `polyvalent` à `distance`** : le corps du texte, la seoDescription, la FAQ et les tags disent tous « distance ». Corrige aussi le regroupement « À découvrir aussi » (l'Intercepteur était rapproché de l'avion rond pour enfants).
5. **Édition 2024 — « venus de 14 nationalités » → « venus de 14 pays »** (impropriété ; `accueil.md` disait déjà « 14 pays »).
6. **Édition 2025 — bénéficiaire corrigé** : `editions/2025.json` affirmait que 2025 avait inauguré Pompiers Solidaires ; or l'export WordPress (« L'édition 2025 conserve sa dimension solidaire… soutien à la DFCI » / « Pour 2026… au profit des Pompiers Solidaires ») **et** `histoire.md` datent la bascule de 2026. Bénéficiaire 2025 → DFCI, fait marquant reformulé. **⚠️ Merci de confirmer que c'est bien la réalité terrain** (vous étiez là, pas nous).

## ⚠️ Décisions à prendre (avec votre relecture)

1. **Slug « avion rond »** : publié en `/avion-papier-rond/` vs `/avion-en-papier-rond/` prévu au plan. Page neuve sans historique SEO — trancher le slug canonique (si changement : passage du subagent redirect-guardian).
2. **Mentions légales** (`src/content/pages/mentions-legales.md`) : entité juridique, adresse, hébergeur, directeur de publication — `TODO` en attente de vos informations.
3. **Apostrophes incohérentes sur une même page** : le contenu éditorial (55 fichiers) utilise l'apostrophe droite `'` tandis que les textes en dur des `.astro` (H1 d'accueil, bouton « S'inscrire », footer) utilisent l'apostrophe typographique `'`. Recommandation : tout normaliser en `'` (typographie française correcte) — dites oui et on l'applique en une passe mécanique.
4. **`seoTitle` des tutoriels planeur et faucon** : `"Tuto Avion en Papier Facile: Le planeur"` et `"Tuto Avion en papier facile: \"LE FAUCON\""` — deux-points sans espace (typographie anglaise) + guillemets droits. MAIS la règle de migration était « titres Rank Math copiés verbatim » : corriger la typographie = changer le titre SERP existant. À trancher : conserver verbatim ou corriger.
5. **7 `seoDescription` trop longues** (> 160 caractères, tronquées par Google) : `pages/imprimer.md` (223), `ressources-avions-papier` (~204), `contact-faq` (~200), `records-avion-en-papier` (~196), `sponsors` (~194), `pages/presse.md` (181), `blog` (~176). Raccourcir ? (pages majoritairement nouvelles, donc pas de contrainte verbatim).
6. **Capitalisation du nom de l'événement** : « Lancer d'Avions en Papier » vs « lancer d'avions en papier » oscille partout, y compris dans les champs SEO. Fixer une forme canonique.
7. **« made in Mérignac »** (`pages/presse.md`) : anglicisme sur un site 100 % FR — intentionnel ?
8. **`contact@` vs `bonjour@`** : l'export WordPress affichait `bonjour@championnatavionpapier.fr` en contact presse ; le nouveau site standardise `contact@` (conforme à `reglages.json`). Confirmer que la boîte `contact@` existe et que l'abandon de `bonjour@` est voulu.
9. **Reprise Rotary : 2022 ou 2023 ?** `histoire.md` dit les deux (« en 2022 » puis « depuis 2023 ») — incohérence héritée telle quelle de l'ancien site. Trancher l'année.
10. **Records mondiaux non sourcés dans l'export WP** : Takuo Toda 29,2 s (2010) et les précisions Ayoob « 69,14 m / 2012 / plié par John Collins » ne figurent pas dans l'ancien site (qui disait juste « Joe Ayoob, près de 69 m, record actuel »). Ces valeurs sont exactes dans le monde réel (records Guinness connus) mais merci de confirmer que vous les assumez. Noter aussi : l'ancien site présentait Ayoob comme « record actuel », le nouveau site le marque `actuel: false` (le record 2022 de 88,31 m le supplante) — cohérent, mais à assumer aussi.
11. **Diagrammes de pliage manquants** : la Flèche n'a pas de diagramme pour l'étape 2 (premiers coins), et `fleche-etape-6.avif` (2ᵉ aile + « même hauteur ») reste inutilisé (doublon de l'étape 5). Nakamura : étapes 6 et 8 sans image. À produire/commander avec le lot faucon/rond/lanceur/intercepteur (décision images du point 5 de RESUME-TOMORROW).
12. **Date de l'événement** : `reglages.json` affiche le 13 juin 2026, or nous sommes le 14 juillet 2026 — l'événement est passé. Si le site bascule maintenant, faut-il mettre à jour la date/le contenu vers l'édition suivante, ou assumer la page « édition 2026 » jusqu'à l'annonce 2027 ?

## ℹ️ Pour information

- **Constat rejeté après contre-vérification** : « l'étape 3 de l'Intercepteur serait auto-référentielle » — faux : après l'étape 2, la pointe (en haut) et la jonction des plis obliques (bas de la couture centrale) sont deux repères distincts ; l'instruction est géométriquement correcte.
- **JSON-LD HowTo sans images d'étapes** : `buildHowTo` (`src/lib/schema.ts`) n'émet que le texte des étapes ; les photos Nakamura/Flèche n'apparaissent pas dans le balisage (schema.org accepte `HowToStep.image`). Amélioration SEO possible, non bloquante.
- **Pas de page 404 personnalisée** (`src/pages/404.astro` absent). Workers static assets sert un 404 générique — à ajouter au backlog QA.
- **Repli codé en dur dans le Footer** (`contact@…`, « Pompiers Solidaires ») : identiques à `reglages.json` aujourd'hui ; simple point de vigilance si ces valeurs changent au CMS.

## Zones vérifiées et propres

- **Faits 2026 vs `reglages.json`** : date (le 13 juin 2026 est bien un samedi), lieu, horaires, tarifs, bénéficiaire, URL HelloAsso, e-mails — cohérents sur les 26 pages. DFCI n'apparaît jamais comme cause courante. Les dérivations code confirmées (Event JSON-LD prix/date, lien Google Agenda).
- **Sponsors** : 13/13 partenaires, ordre et URL identiques à l'ancien site (y compris l'anomalie héritée Aéroclub Montendre → URL marcillac-estuaire).
- **Citations presse** : verbatim et attributions exactes (Sud Ouest ×2, France Bleu Gironde, CNews).
- **Histoire** : tous les faits vérifiables conformes à l'ancien site (2018 Gastes, COVID 2020, Mérignac 2023, 300/14 en 2024, don 5 000 € DFCI…).
- **Orthographe/grammaire** : aucune faute avérée détectée sur l'ensemble du contenu. Guillemets français, accents sur majuscules et espaces avant `; ! ?` corrects.
- **Cohérence des 8 tutoriels** : décomptes d'étapes, matériel, FAQ et références inter-étapes cohérents (après les corrections ci-dessus).
