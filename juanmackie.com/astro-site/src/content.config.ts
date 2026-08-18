import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { writingCategoryOrder } from './data/site';

// Writing collection: essays migrated in-site from Substack / Medium.
// The `slug` of each entry is its filename (matches the original platform URL
// stem so cross-references are trivially auditable). `originalUrl` preserves
// the source for honesty and archive linking.
export const collections = {
  writing: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.enum(writingCategoryOrder),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      curated: z.boolean().default(false),
      draft: z.boolean().default(false),
      // Former Substack / Medium permalink, kept for attribution + archive linking.
      originalUrl: z.string().url().optional(),
      platform: z.enum(['substack', 'medium', 'site']).optional()
    })
  })
};
