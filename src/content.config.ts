import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specimens = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specimens' }),
  schema: z.object({
    no: z.string(),
    name: z.string(),
    class: z.enum(['consumer app', 'creator tool', 'dev tool', 'desktop tool', 'experiment']),
    year: z.number(),
    status: z.enum(['live', 'beta', 'frozen', 'archived']),
    repo: z.string().nullable().default(null),
    links: z.object({ site: z.string().optional(), store: z.string().optional() }).default({}),
    autopsy: z.object({ died: z.string(), cause: z.string(), organs: z.string() }).nullable().default(null),
  }),
});

export const collections = { specimens };
