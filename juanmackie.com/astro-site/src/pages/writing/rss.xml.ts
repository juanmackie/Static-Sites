import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://juanmackie.com').replace(/\/$/, '');
  const entries = (await getCollection('writing', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const items = entries
    .map((entry) => {
      const url = `${base}/writing/${entry.id}`;
      const published = entry.data.date.toUTCString();
      const description = entry.data.description || entry.data.title;
      return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${published}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Juan Mackie — Writing</title>
    <link>${escapeXml(`${base}/writing`)}</link>
    <description>Essays on AI, business, money, tools, and systems by Juan Mackie.</description>
    <language>en-au</language>
    <lastBuildDate>${entries[0]?.data.date.toUTCString() ?? new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
