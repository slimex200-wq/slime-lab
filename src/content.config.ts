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
    links: z.object({
      site: z.string().optional(),
      store: z.string().optional(),
      releases: z.string().optional(),
    }).default({}),
    /** /public 기준 경로 (예: /specimens/weeple/1.png) — 검사실 SPECIMEN IMAGING 그리드 */
    shots: z.array(z.string()).default([]),
    /** 로컬 mp4/webm 경로 — 검사실 시연 영상 (autoplay 안 함) */
    video: z.string().nullable().default(null),
    autopsy: z.object({ died: z.string(), cause: z.string(), organs: z.string() }).nullable().default(null),
  }),
});

export const collections = { specimens };
