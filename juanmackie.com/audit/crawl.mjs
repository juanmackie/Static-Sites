// Reproducible SEO/GEO crawl for juanmackie.com (or BASE env override).
const BASE = (process.env.BASE ?? 'https://juanmackie.com').replace(/\/$/, '');
const sameOrigin = new URL(BASE).origin;
const remapToBase = (value) => {
  const source = new URL(value, BASE);
  return new URL(`${source.pathname}${source.search}`, BASE).toString();
};
const normalize = (value) => {
  const url = new URL(value, BASE);
  url.hash = '';
  return url.toString().replace(/\/$/, '') || url.toString();
};

const sitemapResponse = await fetch(`${BASE}/sitemap.xml`, { redirect: 'follow' });
const sitemapText = await sitemapResponse.text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalize(remapToBase(m[1])));

const results = [];
const inbound = new Map();
const queue = [...sitemapUrls];
const seen = new Set();

async function crawl(url) {
  const normalizedUrl = normalize(url);
  if (seen.has(normalizedUrl)) return;
  seen.add(normalizedUrl);

  let response;
  let body;
  try {
    response = await fetch(normalizedUrl, { redirect: 'follow' });
    body = await response.text();
  } catch (error) {
    results.push({ url: normalizedUrl, error: String(error) });
    return;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const page = {
    url: normalizedUrl,
    finalUrl: response.url,
    finalHost: new URL(response.url).host,
    status: response.status,
    contentType,
    canonical: null,
    canonicalMatch: null,
    title: null,
    titleLen: 0,
    description: null,
    descLen: 0,
    robotsMeta: null,
    h1Count: 0,
    h1: [],
    schema: [],
    internalLinks: [],
    externalLinks: [],
    citationLinks: [],
    answerFirst: false,
    answerSignals: []
  };

  if (!contentType.includes('text/html')) {
    results.push(page);
    return;
  }

  page.canonical = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? null;
  if (page.canonical) page.canonical = normalize(page.canonical);
  const localMode = new URL(BASE).hostname === '127.0.0.1' || new URL(BASE).hostname === 'localhost';
  page.canonicalMatch = page.canonical === normalizedUrl || (localMode && page.canonical && new URL(page.canonical).pathname === new URL(normalizedUrl).pathname);
  page.title = body.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
  page.titleLen = page.title?.length ?? 0;
  page.description = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  page.descLen = page.description?.length ?? 0;
  page.robotsMeta = body.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  page.h1Count = (body.match(/<h1[\s>]/gi) ?? []).length;
  page.h1 = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .slice(0, 2);

  for (const match of body.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1]);
      page.schema.push(value['@type'] ?? 'UNKNOWN');
    } catch {
      page.schema.push('INVALID_JSON');
    }
  }

  const links = [...body.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }));
  const internal = new Set();
  const external = new Set();
  for (const link of links) {
    try {
      const target = new URL(link.href, normalizedUrl);
      if (target.origin === sameOrigin) {
        const targetUrl = normalize(target.toString());
        internal.add(targetUrl);
        inbound.set(targetUrl, (inbound.get(targetUrl) ?? 0) + 1);
        if (!seen.has(targetUrl)) queue.push(targetUrl);
      } else if (target.protocol.startsWith('http')) {
        external.add(target.toString());
      }
    } catch {
      // Ignore malformed non-navigation hrefs; they are not crawl targets.
    }
  }
  page.internalLinks = [...internal];
  page.externalLinks = [...external];
  page.citationLinks = links
    .filter((link) => /source|evidence|original|reference|citation|repository/i.test(link.text))
    .map((link) => link.href);

  const firstContent = body
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1600);
  const signalPatterns = [
    ['tldr', /\bTL;DR\b/i],
    ['direct-answer', /(?:direct answer|short answer|answer:)/i],
    ['faq', /\bFAQPage\b|\bFrequently Asked Questions\b/i],
    ['how-to', /\bHow to\b/i]
  ];
  page.answerSignals = signalPatterns.filter(([, pattern]) => pattern.test(firstContent)).map(([name]) => name);
  page.answerFirst = page.answerSignals.includes('tldr') || page.answerSignals.includes('direct-answer') || page.answerSignals.includes('faq');
  results.push(page);
}

while (queue.length) await Promise.all(queue.splice(0, 8).map(crawl));

const htmlPages = results.filter((page) => page.contentType.includes('text/html'));
const internalTargets = [...inbound.keys()];
const broken = [];
for (const target of internalTargets) {
  try {
    const response = await fetch(target, { redirect: 'follow' });
    if (response.status >= 400) broken.push({ target, status: response.status });
  } catch (error) {
    broken.push({ target, error: String(error) });
  }
}

const sitemapSet = new Set(sitemapUrls);
const crawledSet = new Set(htmlPages.map((page) => normalize(page.url)));
const summary = {
  base: BASE,
  sitemapStatus: sitemapResponse.status,
  sitemapUrls: sitemapUrls.length,
  crawled: results.length,
  htmlPages: htmlPages.length,
  nonHtmlResources: results.length - htmlPages.length,
  statusCounts: Object.fromEntries([...new Set(results.map((page) => page.status))].map((status) => [status, results.filter((page) => page.status === status).length])),
  redirectTargets: [...new Set(results.filter((page) => page.finalUrl !== page.url).map((page) => `${page.url} -> ${page.finalUrl}`))],
  missingCanonical: htmlPages.filter((page) => !page.canonical).map((page) => page.url),
  nonMatchingCanonical: htmlPages.filter((page) => page.canonical && !page.canonicalMatch).map((page) => ({ url: page.url, canonical: page.canonical })),
  missingOrMultipleH1: htmlPages.filter((page) => page.h1Count !== 1).map((page) => ({ url: page.url, h1Count: page.h1Count })),
  titleOutliers: htmlPages.filter((page) => page.titleLen < 30 || page.titleLen > 60).map((page) => ({ url: page.url, length: page.titleLen, title: page.title })),
  descriptionOutliers: htmlPages.filter((page) => page.descLen < 70 || page.descLen > 160).map((page) => ({ url: page.url, length: page.descLen, description: page.description })),
  pagesWithoutSchema: htmlPages.filter((page) => page.schema.length === 0).map((page) => page.url),
  pagesWithoutAnswerFirstSignal: htmlPages.filter((page) => !page.answerFirst).map((page) => page.url),
  pagesWithoutCitationSignals: htmlPages.filter((page) => page.externalLinks.length === 0 && page.citationLinks.length === 0).map((page) => page.url),
  brokenInternalLinks: broken,
  notInSitemap: [...crawledSet].filter((url) => !sitemapSet.has(url)),
  inSitemapNotCrawled: [...sitemapSet].filter((url) => !crawledSet.has(url))
};

console.log(JSON.stringify({ summary, results }, null, 2));
