import type { APIRoute } from 'astro';

const routes = ['/', '/privacy'];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://juanmackie.com';
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => `  <url><loc>${base}${route}</loc></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
