import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../lib/seo';

const FLAT_SLUGS = new Set(['histoire-avions-papier']);

export async function GET(context: APIContext) {
  const articles = (await getCollection('actualites', (e) => !e.data.draft)).sort(
    (a, b) => b.data.datePublication.getTime() - a.data.datePublication.getTime()
  );

  return rss({
    title: 'Actualités — Championnat du Monde de Lancer d’Avions en Papier',
    description:
      'Les actualités du Championnat du Monde de lancer d’avions en papier à Mérignac : édition 2026, cause soutenue, tutoriels et culture de l’avion en papier.',
    site: context.site ?? SITE.url,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.datePublication,
      link: FLAT_SLUGS.has(a.id) ? `/${a.id}/` : `/blog/${a.id}/`,
    })),
    customData: `<language>fr-FR</language>`,
  });
}
