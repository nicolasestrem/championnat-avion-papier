/**
 * Defines the content collections for the Astro project.
 *
 * This file configures the schemas for different types of content,
 * ensuring data consistency and providing type safety.
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection, z } from 'astro:content';

/**
 * The 'blog' collection, containing all blog posts.
 *
 * Each entry in this collection represents a single blog post and is validated
 * against the defined schema.
 */
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    /** The title of the blog post. */
    title: z.string(),
    /** A short description of the blog post, used for summaries and SEO. */
    description: z.string(),
    /** The date the blog post was published. */
    publishDate: z.coerce.date(),
    /** The author of the blog post. Defaults to 'Équipe Championnat'. */
    author: z.string().default('Équipe Championnat'),
    /** The primary category of the blog post. */
    category: z.enum(['Tutoriels', 'Techniques', 'Compétition', 'Actualités']),
    /** An optional array of tags for the blog post. */
    tags: z.array(z.string()).optional(),
    /** The optional path to the cover image for the blog post. */
    image: z.string().optional(),
    /** The optional alt text for the cover image. */
    imageAlt: z.string().optional(),
    /** The optional estimated reading time in minutes. */
    readingTime: z.number().optional(),
  }),
});

/**
 * Exports all defined content collections.
 * This object is used by Astro to register the collections.
 */
export const collections = { blog };