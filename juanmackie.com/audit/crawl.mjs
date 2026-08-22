// SEO/GEO crawl audit for juanmackie.com
const BASE = 'https://juanmackie.com';
const sitemapUrls = [];
const sm = await fetch(`${BASE}/sitemap.xml`).then(r => r.text());
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(m[1]);

const results = [];
const allInternalLinks = new Map(); // url -> count of inbound internal links
const queue = [...sitemapUrls];
const seen = new Set();
const checked = new Set();

async function crawl(url) {
  if (seen.has(url)) return;
  seen.add(url);
  let res, html;
  try {
    res = await fetch(url, { redirect: 'follow' });
    html = await res.text();
  } catch (e) {
    results.push({ url, error: String(e) });
    return;
  }
  checked.add(url);
  const page = { url, status: res.status, finalUrl: res.url };
  // canonical
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  page.canonical = canon;
  page.canonicalMatch = canon === url;
  // title / description
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  page.title = title;
  page.titleLen = title ? title.length : 0;
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  page.descLen = desc ? desc.length : 0;
  // robots meta
  page.robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? null;
  // h1s
  page.h1Count = (html.match(/<h1[\s>]/g) || []).length;
  page.h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).slice(0, 2);
  // structured data types
  const ldTypes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { ldTypes.push(JSON.parse(m[1])['@type']); } catch { ldTypes.push('INVALID_JSON'); }
  }
  page.schema = ldTypes;
  // internal links
  const links = [...html.matchAll(/href="(\/[^"]*|https:\/\/(?:www\.)?juanmackie\.com[^"]*)"/g)].map(m => m[1]);
  const normalized = links.map(h => {
    const abs = new URL(h, url);
    abs.hash = '';
    return abs.toString().replace(/\/$/, '') || abs.toString();
  });
  page.internalLinks = [...new Set(normalized)];
  for (const l of page.internalLinks) allInternalLinks.set(l, (allInternalLinks.get(l) ?? 0) + 1);
  results.push(page);
  // queue new same-site pages
  for (const l of page.internalLinks) {
    if (!seen.has(l) && l.includes('juanmackie.com')) queue.push(l);
  }
}

while (queue.length) await Promise.all(queue.splice(0, 8).map(crawl));

// check orphan / broken internal links (sample unique targets)
const linkTargets = [...allInternalLinks.keys()];
const broken = [];
for (const t of linkTargets) {
  try {
    const r = await fetch(t, { method: 'GET', redirect: 'follow' });
    if (r.status >= 400) broken.push({ target: t, status: r.status });
  } catch (e) { broken.push({ target: t, error: String(e) }); }
}

// in-sitemap but not crawled / crawled but not in sitemap
const crawledSet = new Set(results.map(r => r.url.replace(/\/$/, '')));
const notInSitemap = [...crawledSet].filter(u => !sitemapUrls.map(s => s.replace(/\/$/, '')).includes(u));
const inSitemapNotCrawled = sitemapUrls.filter(u => !crawledSet.has(u.replace(/\/$/, '')));

console.log(JSON.stringify({ results, broken, notInSitemap, inSitemapNotCrawled }, null, 2));
