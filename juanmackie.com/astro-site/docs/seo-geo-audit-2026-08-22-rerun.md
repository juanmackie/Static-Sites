# SEO/GEO audit — 2026-08-22 rerun

## Scope and method

- Repository: `astro-site/`
- Production crawl: `node audit/crawl.mjs > audit/baseline-crawl-2026-08-22-v2.json`
- Crawl source: `https://juanmackie.com/sitemap.xml`; crawl follows internal HTML links, checks response status, final host, canonical, title, description, robots, H1, JSON-LD, internal/external links, citation signals, answer-first signals, and broken internal targets.
- Search benchmark: six fixed target queries in `audit/benchmark-2026-08-22/queries.txt`, checked against Bing, Google, DuckDuckGo, and OpenAI Search. Perplexity and Brave were attempted but unavailable because their API keys are not configured.
- Project rules read before content changes: `README.md` and `docs/claim-rules.md`. There is no separate `brand.md`; the site's existing evidence/uncertainty rules are the voice authority.

## Baseline crawl findings

The crawl found 36 sitemap HTML pages plus one RSS resource. All fetched resources returned 200 after redirects. There are no broken internal links, missing canonicals, H1-count failures, pages missing JSON-LD, sitemap gaps, or orphan pages.

| Dimension | Observation | Impact |
|---|---|---|
| Crawlability | Sitemap is complete; robots allows general and named AI crawlers; all internal targets resolve. | Healthy |
| Indexation/consolidation | Every production HTML page declares a canonical on the non-www host, but the apex currently returns a **307 Temporary Redirect** to `www.juanmackie.com`; README and `astro.config.mjs` still specify non-www as canonical. | **P0 external deployment issue** |
| Page intent | Work pages have direct TL;DR answers. Homepage has FAQ and project/archive surfaces. The memory-stack article answers its topic in the first paragraph but its title is not query-shaped. | P1 query discoverability |
| Titles | 30 of 36 HTML pages fall outside the 30–60 character heuristic: several archive titles are too short and legacy article/work titles are too long. | P1 snippet/relevance |
| Descriptions | 19 of 36 pages fall outside the 70–160 character heuristic, including several truncated or generic legacy descriptions. | P1 snippet/relevance |
| Internal links | No broken internal links; sitemap and crawl sets match. | Healthy |
| Structured data | All 36 HTML pages have JSON-LD. WebPage/WebSite/Person/BreadcrumbList, FAQPage, PodcastSeries, and BlogPosting are present where applicable. BlogPosting can be strengthened with a representative image and section/language fields. | P2 |
| Source citations | Case-study evidence links and original archive links exist where available. Several evergreen/legacy essays have no detectable source/reference links; first-party essays should not gain invented citations. | P2 content quality |
| Answer-first | Case-study TL;DR blocks and homepage FAQ are answer-ready. The six-query benchmark shows the memory-stack topic is not yet consistently discoverable despite the article's direct opening answer. | P1 |

## Fixed target-query benchmark

| # | Query | Clear page target | DuckDuckGo | Bing | Google | OpenAI Search / answer result | Gap |
|---|---|---|---|---|---|---|---|
| 1 | `Juan Mackie fire protection AI automation` | `/` and `/thesis` | `/` ranked first in captured results | Results were irrelevant (Steam) | Blocked by bot check | Cited `/` and related fire-protection sources | Mixed entity signals; not a site technical blocker |
| 2 | `Prompt Paul Chrome extension Juan Mackie` | `/work/prompt-paul` | Challenge page; no reliable rank | Prompt-related unrelated results | Blocked by bot check | Cited `/work/prompt-paul`, product site, and Chrome Web Store | More external mentions/indexing needed |
| 3 | `who is Juan Mackie builder writer Australia` | `/about` and `/` | Challenge page; no reliable rank | Irrelevant travel results | Blocked by bot check | Cited `/` and LinkedIn | Brand/entity query is answer-ready |
| 4 | `Logseq Housekeeper unlinked mentions tool` | `/work/logseq-housekeeper` | Challenge page; no reliable rank | Logseq official results dominate | Blocked by bot check | Cited the homepage/case-study answer and Logseq sources | Improve exact title/answer prominence and allow reindexing |
| 5 | `One at a Time podcast Juan Mackie` | `/#podcast` and `/writing/one-at-a-time-podcast-transcript` | Challenge page; no reliable rank | Irrelevant ONE shipping results | Blocked by bot check | Cited homepage and Apple Podcasts | Podcast page is answer-ready |
| 6 | `agent memory stack SQLite Mnemosyne two-loop architecture` | `/writing/our-agent-memory-stack-how-it-works` | Challenge page; no reliable rank | Irrelevant dictionary/agent results | Blocked by bot check | Did not cite the site; returned general Mnemosyne/SQLite sources | **P1 high-impact query gap** |

## Ranked gaps and decision

1. **P0 — Apex 307 to www while all site signals use non-www.** Highest technical impact, but the redirect is controlled by Coolify/nginx and no deployment configuration exists in this repository. The correct fix is an external permanent redirect to the documented canonical host; it cannot be applied locally without changing the hosting configuration.
2. **P1 — Query-shaped title/answer for the agent-memory priority query.** This is the highest-leverage repository fix because the page already contains the authoritative answer, but the title does not contain the distinctive query terms and the benchmark's OpenAI answer did not cite it.
3. **P1 — Meta title and description outliers.** A shared metadata normalizer can prevent long legacy descriptions/titles from producing weak search snippets without rewriting every essay.
4. **P2 — BlogPosting schema completeness.** Add image, language, and article section metadata.
5. **P2 — Legacy essay citation coverage.** Only add references when facts can be checked against an actual source; do not fabricate citations.

### Selected fix

Fix the agent-memory page's query alignment first, then normalize metadata and strengthen BlogPosting JSON-LD in the same small, reversible change. The external redirect remains a deployment follow-up, not a silently changed canonical strategy.

## Changes made

- `src/content/writing/our-agent-memory-stack-how-it-works.md`: retitled the article to `Agent Memory Stack — SQLite + Mnemosyne`, tightened its description, and labeled the opening paragraph `Answer:` so the target query has an explicit answer-first passage.
- `src/layouts/BaseLayout.astro`: added shared title compaction and description trimming for search/social metadata while preserving the full on-page copy. Archive/work titles now stay descriptive rather than being cut at arbitrary character boundaries.
- `src/pages/work/[slug].astro`: gave the four main project pages concise, intent-shaped metadata titles.
- `src/pages/writing/[...slug].astro`: added `image`, `inLanguage`, and `articleSection` to `BlogPosting` JSON-LD.
- Tightened several legacy writing titles/descriptions and expanded the privacy description.
- `audit/crawl.mjs`: made the crawl reproducible with `BASE=...`, sitemap-to-local remapping, HTML/resource separation, citation and answer-first signals, and a summarized output.

## Post-fix verification

`npm run build` passes and produces 37 static pages. The identical crawler against the built preview (`BASE=http://127.0.0.1:4321 node audit/crawl.mjs`) reports in `audit/post-fix-crawl-2026-08-22-v5.json`:

- 36 HTML pages plus one RSS resource, all 200.
- Zero missing canonicals, zero canonical path mismatches, zero H1-count failures, zero missing JSON-LD pages, zero broken internal links, and zero sitemap gaps.
- One remaining title heuristic outlier: the short utility-page title `Privacy Policy — Juan Mackie` (28 characters).
- Seven short-description heuristic outliers, all legacy/utility pages; none is a missing description or a critical page. No new citation claims were invented.
- The four priority project pages and the memory-stack page have answer-first signals; the memory page now has an explicit `Answer:` opening and `public/llms.txt` contains an exact-query answer mapping.
- BlogPosting JSON-LD on the memory page contains the new image, language, and section fields.

The production crawl was also rerun before the local build and still records the hosting-layer 307 apex-to-www redirect. Because the changed files are not deployed from this workspace, production HTML and external search indexes cannot reflect the fix yet.

## Post-fix benchmark

The same six queries were rerun through OpenAI Search and Bing after the answer/metadata changes. OpenAI continued to cite the site for the fire-protection, Prompt Paul, identity, Logseq, and podcast queries. It still answered the memory query with general Mnemosyne/SQLite sources rather than citing the site; this is an indexing/authority gap, not a missing answer on the built page. Because the repository is not deployed from this workspace, this benchmark still observes the pre-fix production HTML. Bing placed `juanmackie.com` first for query 1, while the other project/identity queries remained noisy or omitted the site. Google returned a bot-check page for all six captured requests. DuckDuckGo returned a rate-limit/challenge page on the rerun. Brave and Perplexity API runs were unavailable because credentials are not configured.

## Remaining high-impact item

The repository has no critical crawl/indexation defect after the build verification. One high-impact production/deployment gap remains: Coolify/nginx must change the apex redirect from 307 to a permanent 301 (or otherwise make the documented non-www canonical host the actual redirect target). After deployment, rerun `node audit/crawl.mjs` against production and repeat the six-query benchmark after reindexing; search-engine changes cannot be honestly verified before those external steps.
