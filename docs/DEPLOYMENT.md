# Déploiement & bascule DNS — championnatavionpapier.fr

Ce guide couvre les étapes qui nécessitent **vos comptes GitHub et Cloudflare**. Le site Astro est déjà construit et validé (`npm run build` → 26 pages). Rien n'est mis en ligne tant que vous n'avez pas exécuté ces étapes.

## 1. Analytics Cloudflare (avant le premier déploiement)

Dans `src/layouts/BaseLayout.astro`, le beacon d'analytics contient `REPLACE_WITH_CF_ANALYTICS_TOKEN`. Créez une propriété **Cloudflare Web Analytics** (gratuit, sans cookie) et remplacez ce jeton. Sinon, retirez la ligne `<script ... beacon.min.js ...>`.

## 2. Déploiement (preview) via Cloudflare Workers Builds

1. Sur le dashboard Cloudflare → **Workers & Pages → Créer → Connexion à Git**, sélectionnez ce dépôt.
2. Build command : `npm run build` · Output : `dist` · Branche de preview : `migrate-wordpress-to-astro`.
3. Lancez un build. Vérifiez le site sur l'URL `*.workers.dev` : navigation, images, redirections (`public/_redirects` est servi automatiquement par Workers static assets), page `/admin/`.

## 3. CMS Sveltia — OAuth GitHub

Le code du Worker d'auth est dans `workers/sveltia-cms-auth/` (aucun secret commité).

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App** :
   - Homepage URL : `https://championnatavionpapier.fr`
   - Authorization callback URL : `https://<votre-worker>.workers.dev/callback`
2. Déployez le Worker :
   ```bash
   cd workers/sveltia-cms-auth
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   npx wrangler deploy
   ```
3. Dans `public/admin/config.yml`, remplacez `base_url: https://REPLACE_WITH_OAUTH_WORKER` par l'URL du Worker déployé, puis rebuild/redeploy.
4. Ajoutez les éditeurs (membres du Rotary) comme **collaborateurs** du dépôt GitHub. Ils se connectent sur `/admin/`, éditent, et chaque enregistrement crée un commit sur `main` → un nouveau build Cloudflare → en ligne en ~2 min.

## 4. Checklist de bascule DNS (à faire APRÈS validation de la preview et revue du contenu)

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
