import type { APIRoute } from 'astro';

const routes = [
  { path: '/', lastmod: '2025-01-01', changefreq: 'weekly', priority: '1.0' },
  { path: '/privacy', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.3' }
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
