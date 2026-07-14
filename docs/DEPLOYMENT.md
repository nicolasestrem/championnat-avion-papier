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
3. `base_url` renseigné dans `public/admin/config.yml`.
4. **Reste à faire** : ajouter les éditeurs (membres du Rotary) comme **collaborateurs** du dépôt GitHub. Ils se connectent sur `/admin/`, éditent, et chaque enregistrement crée un commit sur `main` → un nouveau build Cloudflare → en ligne en ~2 min.

⚠️ **Aucun enregistrement CMS avant la fusion de la PR #1** : le CMS écrit sur `main`, qui ne contient pas encore le site Astro. Test de connexion seul autorisé.

## 4. Checklist de bascule DNS (à faire APRÈS validation de la preview et revue du contenu)

- [ ] **Aller-retour CMS complet juste après la fusion de la PR #1** : connexion sur `/admin/`, édition d'une entrée avec téléversement d'image, vérifier que le commit produit un chemin résolvable par `image()` et que le build Cloudflare passe (seule façon de confirmer les `media_folder` relatifs de `config.yml`).
- [ ] Preview verte : Lighthouse mobile ≥ 95 sur `/`, un tutoriel, `/contact-faq/`.
- [ ] Test des redirections en conditions réelles (301) sur la preview.
- [ ] Validation des données structurées (Google Rich Results) : Event, HowTo, FAQPage.
- [ ] Sauvegarde complète du WordPress actuel.
- [ ] Abaisser le TTL DNS (ex. 300 s) 24 h avant.
- [ ] Ajouter `championnatavionpapier.fr` comme **domaine personnalisé** du Worker.
- [ ] Garder le WordPress accessible sur un sous-domaine temporaire (rollback).
- [ ] Re-tester les redirections sur le domaine live.
- [ ] Soumettre `https://championnatavionpapier.fr/sitemap-index.xml` dans Search Console.
- [ ] Surveiller le CTR de `/tuto-avion-en-papier-facile-planeur/` (page #1 en trafic, réécrite).

## 5. Rollback

La bascule DNS est réversible : repointez l'enregistrement vers l'ancien hébergeur WordPress (gardé en ligne sur un sous-domaine). Aucun contenu n'est perdu — tout le contenu du nouveau site vit dans ce dépôt Git.
