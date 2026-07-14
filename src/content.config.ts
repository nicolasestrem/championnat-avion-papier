import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const reglages = defineCollection({
  loader: file('src/content/reglages/reglages.json'),
  schema: z.object({
    dateISO: z.string(),
    dateLabel: z.string(),
    lieu: z.string(),
    ville: z.string(),
    horaireSelections: z.string(),
    horaireFinales: z.string(),
    tarifCompetiteur: z.string(),
    entreeVisiteur: z.string(),
    beneficiaire: z.string(),
    helloAssoUrl: z.string().url(),
    emailContact: z.string().email(),
    emailPrivacy: z.string().email(),
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
  }),
});

const tutoriels = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/tutoriels' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    difficulte: z.enum(['facile', 'intermediaire', 'avance']),
    typeVol: z.enum(['distance', 'duree', 'polyvalent']),
    dureePliage: z.string(),
    image: image(),
    imageAlt: z.string(),
    etapes: z.array(z.object({ texte: z.string(), image: image().optional(), alt: z.string().optional() })),
    materiel: z.array(z.string()).default(['Une feuille A4']),
    faq: z.array(z.object({ q: z.string(), r: z.string() })).default([]),
    tags: z.array(z.string()).default([]),
    datePublication: z.coerce.date(),
    dateMaj: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const actualites = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/actualites' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    image: image().optional(),
    imageAlt: z.string().optional(),
    datePublication: z.coerce.date(),
    dateMaj: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const editions = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/editions' }),
  schema: ({ image }) => z.object({
    annee: z.number(),
    lieu: z.string(),
    participants: z.number().optional(),
    nations: z.number().optional(),
    parrain: z.string().optional(),
    faitsMarquants: z.array(z.string()).default([]),
    records: z.array(z.object({ categorie: z.string(), detenteur: z.string(), valeur: z.string() })).default([]),
    galerie: z.array(z.object({ image: image(), alt: z.string() })).default([]),
    beneficiaire: z.string().optional(),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/sponsors' }),
  schema: ({ image }) => z.object({
    nom: z.string(), url: z.string().url(),
    logo: image().optional(), descriptif: z.string(), ordre: z.number().default(99),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(), reponse: z.string(),
    categorie: z.enum(['pratique', 'inscription', 'sur-place', 'general']),
    ordre: z.number().default(99),
  }),
});

const records = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/records' }),
  schema: z.object({
    categorie: z.string(), detenteur: z.string(), valeur: z.string(),
    annee: z.number(), contexte: z.string().optional(), actuel: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pages' }),
  schema: ({ image }) => z.object({
    title: z.string(), seoTitle: z.string(), seoDescription: z.string(),
    image: image().optional(), imageAlt: z.string().optional(),
  }),
});

export const collections = { reglages, tutoriels, actualites, editions, sponsors, faq, records, pages };
