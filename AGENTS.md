# Static Sites agent contract

## Operating Standard

- Apply `C:\Users\juanm\Documents\GitHub\Vibe Coding Rules 10.md` (V10) as the
  repository operating standard; read it in full before substantive work.
- This file is the nearest-owning contract. It refines the parent policy with
  repository-specific facts and cannot weaken a mandatory parent rule; conflicts
  resolve to the parent.

## Scope and Ownership

- `juanmackie.com/astro-site/` — Astro portfolio site (`juanmackie.com`). Source
  of truth for that site's generated output; never hand-edit `dist/`.
  Dependencies: `astro`, `three` (see its `package.json`; scripts: `dev`,
  `build`, `preview`).
- `juanmackie.com/astro-site/docs/` — site-specific contract docs: claim rules,
  performance budget, SEO/Geo audits, content baseline. Read the relevant one
  before touching site claims or performance.
- `promptpaul.juanmackie.com/` — standalone hand-authored static site
  (`index.html`, `assets/`, `guides/`, `robots.txt`, `sitemap.xml`). No build
  step, no package manifest.
- `juanmackie.com/audit/` — crawl/build evidence and review scripts from past
  audits. Historical evidence is not source code; do not rewrite it to change
  past results.
- `juanmackie.com/src/` — additional source adjacent to `astro-site/`; check
  whether a change here belongs to the Astro site before editing.
- `ARA Forms/` — currently empty; do not assume content or tooling exists there.

## Constraints

- Both sites must remain static and deployable without server-side secrets.
- Never hardcode, expose, or commit credentials. Local `.env` files, generated
  builds, dependencies, temporary files, and private plans stay ignored.
- Treat external links, analytics, forms, and downloads as trust boundaries;
  use HTTPS where supported and avoid collecting unnecessary user data.
- Keep public claims accurate and distinguish documentation from live product
  functionality. Before publishing fire-protection or project-status claims,
  follow `juanmackie.com/astro-site/docs/claim-rules.md`. `[CONFIRM]` markers
  in copy (see `src/data/site.ts`) require Juan's review before release.
- Preserve valid relative links and accessible HTML in the Prompt Paul site;
  no build step may paper over broken links or markup.
- Astro site content pipeline: writing is first-party Markdown in
  `src/content/writing/*.md`, validated by `src/content.config.ts`;
  `/writing/rss.xml` and `/sitemap.xml` are generated from the collection.
  Substack and Medium remain source archives only; this site does not redirect
  external platform URLs.
- Astro site deploy contract (per its README): Coolify builds from GitHub with
  `npm ci && npm run build`, publishes `dist/`, canonical domain
  `juanmackie.com` with `www` redirecting to apex.
- Do not commit, push, deploy, publish, or perform destructive actions without
  explicit user authorization (mandatory parent rule).

## Verification

- Astro site build: `cd juanmackie.com/astro-site && npm ci && npm run build`.
  Evidence: `build` script in `package.json`; also the documented Coolify build
  command. Publish directory is `dist/`.
- Dependency audit: `npm audit --omit=dev --audit-level=high` in
  `juanmackie.com/astro-site/`. Evidence: documented in its README.
- Content sync after adding an essay: `npx astro sync` then `npm run build`.
  Evidence: documented in `juanmackie.com/astro-site/README.md`.
- Check static-site links and references after HTML or route changes. This is
  a manual crawl; prior crawl scripts and results in `juanmackie.com/audit/`
  are examples, not a maintained harness.
- Deploy-redirect checks (documented, require network):
  `curl -I https://www.juanmackie.com` and
  `curl -I https://juanmackie.com/sitemap.xml` verify the canonical redirect
  from the raw response.
- There is no automated test suite in this repository. The smallest runnable
  check for the Prompt Paul site is opening `index.html` and the changed guide
  pages in a browser and verifying links, rendering, and console errors by
  hand.
- Always inspect the final diff and confirm no secrets, generated output, or
  local configuration is included.
