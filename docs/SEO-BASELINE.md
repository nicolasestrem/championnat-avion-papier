# SEO — baseline et suivi

Référence figée au **20 juillet 2026**, avant la mise en production des correctifs
de métadonnées (branche `seo/metadata-and-internal-linking`). Sert de point de
comparaison pour les audits suivants.

Source : Google Search Console, propriété `sc-domain:championnatavionpapier.fr`,
fenêtre 90 jours **2026-04-21 → 2026-07-20**, `dataState: all`.

## 1. Le piège à éviter : la saisonnalité de l'événement

**Une chute de clics après la mi-juin n'est pas une régression.** L'édition 2026
s'est tenue le **13 juin 2026** (`src/content/reglages/reglages.json`).

| Fenêtre | Clics | Impressions | CTR | Position moy. |
|---|---|---|---|---|
| 28 j (22/06 → 20/07) | 101 | 6 999 | 1,44 % | 6,49 |
| 28 j précédents (25/05 → 21/06) | 260 | 6 908 | 3,76 % | 6,04 |

−61 % de clics, mais **les impressions sont stables** (+1,3 %) et la requête
`championnat du monde avion en papier` est passée de 18 clics à 0 **en conservant
la position 1,0**. La demande a disparu, pas le classement. Les clics
hebdomadaires ont culminé à 141 la semaine du 09/06 avant de retomber à 20–28.

Avant de diagnostiquer quoi que ce soit après un événement, comparer les
**impressions** et la **position**, jamais les clics seuls.

## 2. Le vrai gisement : le cluster tutoriels

Le trafic pérenne ne vient pas de l'événement mais des tutoriels — et il
convertissait mal.

| Métrique (90 j) | Valeur |
|---|---|
| Total site | 583 clics · 24 632 impressions · 2,37 % CTR · pos. 6,41 |
| `/tuto-avion-en-papier-facile-planeur/` | **177 clics · 19 123 impressions · 0,93 % CTR · pos. 6,82** |
| Tranche position 4–10 | 175 requêtes · 15 185 impressions · **123 clics (0,81 % CTR)** |

Le CTR attendu en position ~7 est d'environ 3 %. Les classements existent déjà ;
c'étaient les titres et descriptions qui ne déclenchaient pas le clic.

### Requêtes de référence

| Requête | Impressions | CTR | Position |
|---|---|---|---|
| `tuto avion en papier` | 4 010 | 0,32 % | 7,74 |
| `avion en papier planeur` | 1 628 | 1,60 % | 5,56 |
| `planeur en papier` | 1 320 | 0,53 % | 4,96 |
| `avion papier planeur` | 910 | 1,54 % | 3,45 |
| `tuto avion en papier facile` | 686 | 0,29 % | 6,59 |
| `avion en papier rond` + `avion papier rond` | 356 | ~2 % | 6,4–7,0 |

Note lexicale importante : **« tuto » écrase « tutoriel »** dans la demande réelle
(4 010 vs 208 impressions). Rédiger les titres avec le mot des utilisateurs.

## 3. Ce qui a été corrigé

Voir le `CHANGELOG.md` (section `[Unreleased]`) pour le détail. En résumé :
métadonnées des 3 tutoriels hérités de WordPress, retitrage du pilier
`/ressources-avions-papier/`, liens internes contextuels vers `/avion-papier-rond/`,
images Open Graph par tutoriel, schéma `BlogPosting`, garde-fou `parsePrice()`.

## 4. Ce qu'il ne faut PAS « corriger »

L'inspection d'URL ne détecte que `Breadcrumbs` sur les pages tutoriels, alors que
`TutorialLayout` émet aussi `HowTo` et `FAQPage`. **C'est le comportement normal** :
Google a retiré les rich results `HowTo` et réservé `FAQPage` aux sites
gouvernementaux et de santé. Les schémas restent en place — ils gardent leur valeur
pour les surfaces IA et les futurs consommateurs de données structurées. Ne pas les
supprimer en croyant réparer un bug.

## 5. Santé technique au 20/07/2026

Tout est vert, rien à faire de ce côté :

- Indexation : `Submitted and indexed`, `robotsTxtState: ALLOWED`, dernier crawl 19/07
- Canonique auto-référente (Google et déclarée concordent)
- Sitemaps `sitemap-0.xml` et `sitemap-index.xml` : **0 erreur, 0 avertissement**
- `public/_redirects` : les cibles testées répondent (`/contact-faq-2-2/` → `/activites/` → 200)
- Répartition appareils sans écart notable (mobile 2,48 % vs desktop 2,37 % de CTR)

**Non mesuré** : PageSpeed Insights a renvoyé HTTP 429 (quota) pendant l'audit. Les
Core Web Vitals n'ont pas été relevés — à refaire avant de conclure quoi que ce soit
sur la performance.

## 6. Prochaine mesure

À faire **~21 jours après la mise en production**, en comparant à cette page :

1. CTR de `/tuto-avion-en-papier-facile-planeur/` — référence **0,93 %**.
2. **La position doit rester stable** (~6,8). Seul le CTR doit bouger : ces
   changements ne touchent ni le contenu de fond ni les URLs. Une position qui
   dérive signale autre chose et mérite enquête.
3. Impressions de `/avion-papier-rond/` — référence **4**. Une hausse indique que
   Google a compris la distinction entre les deux pages.
4. Position de `/ressources-avions-papier/` sur `tuto avion en papier` — référence
   position 7,74 côté page planeur, 1,08–1,93 côté page ressources sur ~130
   impressions seulement.

Objectif : porter le trafic organique hors-événement de ~85 à ~200 clics/mois.
