# SEO/GEO audit — 2026-08-22

Full-crawl audit (81 URLs crawled across both hosts) plus search/AI answer-engine
benchmark for six target queries.

## Gap ranking (by expected impact)

| # | Priority | Gap | Status |
|---|----------|-----|--------|
| 1 | P0 | Apex `https://juanmackie.com/*` returns **307 (temporary)** redirect to www while every canonical/sitemap signal uses non-www. Mixed consolidation signals. | **OPEN — server-side fix required** in Coolify/nginx: change apex→www redirect to permanent (301). |
| 2 | P1 | Broken/truncated meta descriptions on writing pages ("Episode 1", "The Great Debate: Renting vs.", "THIS IS NOT FINANCIAL ADVICE…", title-fallback). | **FIXED** — real descriptions written for 4 posts. |
| 3 | P1 | Duplicate `<h1>` on `/writing/our-agent-memory-stack-how-it-works`. | **FIXED** — markdown h1 removed; template h1 retained. |
| 4 | P1 | No GEO layer: no `llms.txt`, robots.txt had no explicit AI-crawler policy. | **FIXED** — `public/llms.txt` added; robots.txt now explicitly allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, etc. |
| 5 | P2 | Podcast entity unanchored — no PodcastSeries schema. | **FIXED** — PodcastSeries JSON-LD on homepage with Spotify/Apple/Overcast sameAs + Buzzsprout feed. |
| 6 | P2 | "Logseq Housekeeper / unlinked mentions" query answered by logseq.com docs, not the case study. Answer-first depth on case-study pages. | OPEN — candidate: TL;DR/direct-answer block atop case-study pages. |
| 7 | P3 | Titles >60 chars on legacy posts; BlogPosting lacks `image`; trailing-slash dupes (canonicals handle them). | OPEN — low impact, accepted. |

## Verified healthy

Canonicals match on all 37 content pages · zero broken internal links · zero orphan
pages · sitemap complete and matches crawl · correct 404 status · valid RSS
(`text/xml`) · og-image present · WebPage/WebSite/Person(sameAs)/BreadcrumbList/
FAQPage/BlogPosting schema present · brand queries ("who is Juan Mackie", "Prompt
Paul") cite juanmackie.com in AI answers.

## Benchmark queries (round 1 baseline)

1. `Juan Mackie fire protection AI automation` — site cited, but Auscoast FieldAI ranks first.
2. `Prompt Paul Chrome extension Juan Mackie` — product site cited; main site secondary. OK.
3. `who is Juan Mackie builder writer Australia` — site cited first; some entity confusion with LinkedIn profiles.
4. `Logseq Housekeeper unlinked mentions tool` — **site absent**; Logseq official docs dominate.
5. `One at a Time podcast Juan Mackie` — Apple Podcasts first, site second. OK.
6. `agent memory stack SQLite Mnemosyne two-loop architecture` — **site absent**; other Mnemosyne projects dominate (post published 2026-08-18, likely not yet re-indexed).

## Round-2 rerun checklist

After deploy + Search Console reindex:

- [ ] Confirm apex redirect is 301 (not 307).
- [ ] Recrawl: descriptions/H1/llms.txt/PodcastSeries live.
- [ ] Re-run the six benchmark queries.
- [ ] Decide on case-study TL;DR blocks (gap #6).
