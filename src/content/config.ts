import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Équipe Championnat'),
    category: z.enum(['Tutoriels', 'Techniques', 'Compétition', 'Actualités']),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    readingTime: z.number().optional(), // in minutes
  }),
});

export const collections = { blog };