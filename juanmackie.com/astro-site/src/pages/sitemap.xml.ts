import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// lastmod for static pages changes only after material content changes.
const STATIC_LASTMOD = '2026-08-10';

const staticRoutes = [
  { path: '/', lastmod: STATIC_LASTMOD, changefreq: 'weekly', priority: '1.0' },
  { path: '/about', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.6' },
  { path: '/work', lastmod: STATIC_LASTMOD, changefreq: 'weekly', priority: '0.9' },
  { path: '/work/prompt-paul', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.7' },
  { path: '/work/logseq-housekeeper', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.7' },
  { path: '/work/route-o-matic', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.6' },
  { path: '/work/suretydoc', lastmod: STATIC_LASTMOD, changefreq: 'yearly', priority: '0.3' },
  { path: '/work/fire-protection-operations', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.7' },
  { path: '/thesis', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
  { path: '/method', lastmod: STATIC_LASTMOD, changefreq: 'yearly', priority: '0.5' },
  { path: '/direction', lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.5' },
  { path: '/writing', lastmod: STATIC_LASTMOD, changefreq: 'weekly', priority: '0.8' },
  { path: '/privacy', lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' }
];

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://juanmackie.com';
  const writings = await getCollection('writing', ({ data }) => !data.draft);
  const writingRoutes = writings.map((entry) => ({
    path: `/writing/${entry.id}`,
    lastmod: (entry.data.updated ?? entry.data.date).toISOString().slice(0, 10),
    changefreq: 'monthly',
    priority: '0.6'
  }));
  const routes = [...staticRoutes, ...writingRoutes];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => `  <url><loc>${base}${route.path}</loc><lastmod>${route.lastmod}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
