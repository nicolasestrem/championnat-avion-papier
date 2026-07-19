# Déploiement & bascule DNS — championnatavionpapier.fr

Ce guide couvre les étapes qui nécessitent **vos comptes GitHub et Cloudflare**. Le site Astro est déjà construit et validé (`npm run build` → 26 pages). Rien n'est mis en ligne tant que vous n'avez pas exécuté ces étapes.

## 1. Analytics Cloudflare — ✅ fait (14/07/2026)

Propriété **Cloudflare Web Analytics** créée pour l'hôte `championnatavionpapier.fr` (compte Estrem, sans cookie). Le jeton du beacon est en place dans `src/layouts/BaseLayout.astro`. Les statistiques n'apparaîtront qu'une fois le domaine servi (les visites sur `*.workers.dev` sont comptées sous la même propriété si le beacon est chargé).

## 2. Déploiement (preview) via Cloudflare Workers Builds

1. Sur le dashboard Cloudflare → **Workers & Pages → Créer → Connexion à Git**, sélectionnez ce dépôt.
2. Build command : `npm run build` · Output : `dist` · Branche de preview : `migrate-wordpress-to-astro`.
3. Lancez un build. Vérifiez le site sur l'URL `*.workers.dev` : navigation, images, redirections (`public/_redirects` est servi automatiquement par Workers static assets), page `/admin/`.

## 3. CMS Sveltia — OAuth GitHub — ✅ déployé (14/07/2026)

Le code du Worker d'auth est dans `workers/sveltia-cms-auth/` (aucun secret commité).

État actuel :
1. OAuth App GitHub créée (callback `https://sveltia-cms-auth.nicolas-estrem.workers.dev/callback`) ; secrets `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` posés sur le Worker.
2. Worker déployé : `https://sveltia-cms-auth.nicolas-estrem.workers.dev` (redeploy : `npx wrangler deploy --config workers/sveltia-cms-auth/wrangler.toml`).
   ✅ **Correctif de sécurité OAuth déployé (14/07/2026, version `04986378`)** : origine CMS persistée en cookie HttpOnly et validée avant tout `postMessage` du token (revue PR #1, P1). **Reste à refaire le test de connexion** sur la preview `/admin/` pour confirmer que le handshake fonctionne toujours avec le nouveau code.
3. `base_url` renseigné dans `public/admin/config.yml`.
4. **Reste à faire** : ajouter les éditeurs (membres du Rotary) comme **collaborateurs** du dépôt GitHub. Ils se connectent sur `/admin/`, éditent, et chaque enregistrement crée un commit sur `main` → un nouveau build Cloudflare → en ligne en ~2 min.

⚠️ **Aucun enregistrement CMS avant la fusion de la PR #1** : le CMS écrit sur `main`, qui ne contient pas encore le site Astro. Test de connexion seul autorisé.

✅ **Test de connexion réussi (14/07/2026)** sur la preview `*.workers.dev/admin/` : OAuth GitHub complet, interface Sveltia chargée avec les 8 collections. (Les compteurs affichent 0 tant que `main` n'a pas le contenu — attendu.) Le beacon Web Analytics a également été vérifié sur la preview (requête `cdn-cgi/rum` → 204). NB : la preview `*.workers.dev` est protégée par Cloudflare Access (org `leophir`) — connexion Access requise avant toute QA navigateur.

## 4. Checklist de bascule DNS (à faire APRÈS validation de la preview et revue du contenu)

- [ ] **Aller-retour CMS complet juste après la fusion de la PR #1** : connexion sur `/admin/`, édition d'une entrée avec téléversement d'image, vérifier que le commit produit un chemin résolvable par `image()` et que le build Cloudflare passe (seule façon de confirmer les `media_folder` relatifs de `config.yml`).
- [ ] Preview verte : Lighthouse mobile ≥ 95 sur `/`, un tutoriel, `/contact-faq/`.
- [ ] Test des redirections en conditions réelles (301) sur la preview.
- [ ] Validation des données structurées (Google Rich Results) : Event, HowTo, FAQPage.
- [ ] Sauvegarde complète du WordPress actuel.
- [ ] Abaisser le TTL DNS (ex. 300 s) 24 h avant.
- [ ] Ajouter `championnatavionpapier.fr` comme **domaine personnalisé** du Worker.
- [ ] **Règle de redirection zone Cloudflare** : `www.championnatavionpapier.fr/*` → apex, 301 (impossible à exprimer dans `public/_redirects`, qui ne matche que des chemins).
- [ ] **Désactiver les règles Cloudflare héritées de WordPress** si présentes : APO, Page Rules, Cache Rules (elles serviraient du cache WordPress périmé sur le nouveau site).
- [ ] Vérifier que la preview `*.workers.dev` reste protégée par Cloudflare Access et que le worker OAuth conserve la variable `ALLOWED_DOMAINS=championnatavionpapier.fr`.
- [ ] Garder le serveur WordPress **allumé et son chemin d'origine restaurable** (tunnel / enregistrement DNS d'origine conservés, juste plus pointés par le domaine) pendant ~1 mois pour le rollback — mais **pas de sous-domaine public** vers WordPress (contenu dupliqué + surface d'attaque) ; l'accès de vérification se fait via le LAN.
- [ ] Re-tester les redirections sur le domaine live (`curl -I` sur 2-3 anciennes URL → 301).
- [ ] Soumettre `https://championnatavionpapier.fr/sitemap-index.xml` dans Search Console (les anciens sitemaps Rank Math `/sitemap_index.xml` etc. redirigent désormais en 301).
- [ ] Surveiller le CTR de `/tuto-avion-en-papier-facile-planeur/` (page #1 en trafic, réécrite).
- [ ] Semaines 1-4 : vérifier les nouvelles 404 dans Search Console — chaque 404 légitime = une ligne à ajouter dans `public/_redirects`.

## 5. Rollback

La bascule est réversible en ~1 minute : Cloudflare → Worker → retirer le domaine personnalisé, puis restaurer l'ancien enregistrement DNS/tunnel vers le serveur WordPress (gardé allumé, chemin d'origine intact, pendant ~1 mois après la bascule). Aucun contenu n'est perdu — tout le contenu du nouveau site vit dans ce dépôt Git.

## 6. AdSense

**Google AdSense (Auto Ads)** activé sur tout le site le 19/07/2026 : script chargeur
ajouté dans `src/components/seo/BaseHead.astro` (inclus par les 4 layouts, donc sur
les 17 routes de pages), identifiant client `ca-pub-9063907623690482`. `public/ads.txt`
publié à la racine avec la ligne fournie par Google (`google.com, pub-9063907623690482,
DIRECT, f08c47fec0942fa0`).

Placement automatique uniquement (Auto Ads) — aucun bloc publicitaire manuel.

⚠️ **Pas de bandeau de consentement cookies (RGPD) mis en place dans ce changement.**
La politique de consentement EU de Google impose un CMP avant de servir des annonces
(ou au minimum des annonces non personnalisées) aux visiteurs UE/EEE. C'est une lacune
connue, gérée séparément par le porteur du projet — pas un oubli.

## 7. Google Analytics 4 et Google Tag Manager

**GA4** et **Google Tag Manager** sont chargés sur toutes les pages publiques via
`src/layouts/BaseLayout.astro` :

- mesure GA4 directe : `G-EHTVL72LRY` ;
- conteneur GTM : `GTM-N59XNT8X` ;
- `/admin/` reste exclu, car Sveltia CMS est une page autonome copiée depuis `public/`.

Le conteneur GTM publié a été contrôlé le 19/07/2026 et ne contenait aucun tag
(`"tags":[]`). La configuration GA4 directe est donc l'unique source des pages vues.
Si `G-EHTVL72LRY` est ajouté ultérieurement dans GTM, il faut retirer dans la même
version le chargeur et l'appel `gtag('config', 'G-EHTVL72LRY')` de `BaseLayout.astro`
afin d'éviter les événements en double.

Le contrôle `npm run check:analytics`, inclus dans `npm run verify`, inspecte chaque
page HTML publique générée et valide les identifiants, le nombre d'occurrences, l'ordre
des scripts et la position du fallback GTM.

⚠️ **Ce branchement ne met pas en place de CMP ni de Consent Mode.** Les exigences de
consentement UE/EEE doivent être traitées avec la lacune déjà documentée pour AdSense
avant l'utilisation en production.
