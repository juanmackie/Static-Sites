import type { APIRoute } from 'astro';

// lastmod must be updated only after material content changes.
const TODAY = '2026-08-10';

const routes = [
  { path: '/', lastmod: TODAY, changefreq: 'weekly', priority: '1.0' },
  { path: '/about', lastmod: TODAY, changefreq: 'monthly', priority: '0.6' },
  { path: '/work', lastmod: TODAY, changefreq: 'weekly', priority: '0.9' },
  { path: '/work/prompt-paul', lastmod: TODAY, changefreq: 'monthly', priority: '0.7' },
  { path: '/work/logseq-housekeeper', lastmod: TODAY, changefreq: 'monthly', priority: '0.7' },
  { path: '/work/route-o-matic', lastmod: TODAY, changefreq: 'monthly', priority: '0.6' },
  { path: '/work/suretydoc', lastmod: TODAY, changefreq: 'yearly', priority: '0.3' },
  { path: '/work/fire-protection-operations', lastmod: TODAY, changefreq: 'monthly', priority: '0.7' },
  { path: '/thesis', lastmod: TODAY, changefreq: 'monthly', priority: '0.8' },
  { path: '/method', lastmod: TODAY, changefreq: 'yearly', priority: '0.5' },
  { path: '/direction', lastmod: TODAY, changefreq: 'monthly', priority: '0.5' },
  { path: '/writing', lastmod: TODAY, changefreq: 'weekly', priority: '0.7' },
  { path: '/privacy', lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' }
];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://juanmackie.com';
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => `  <url><loc>${base}${r.path}</loc><lastmod>${r.lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
