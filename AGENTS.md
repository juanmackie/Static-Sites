# Static Sites — Agent Guidance

## Purpose

This repository contains static public sites: the Astro-built `juanmackie.com`
site and the source-controlled static `promptpaul.juanmackie.com` site.

## Local contracts

- Keep both sites static and deployable without server-side secrets.
- Never hardcode, expose, or commit credentials. Local `.env` files, generated
  builds, dependencies, temporary files, and private plans stay ignored.
- Treat external links, analytics, forms, and downloads as trust boundaries;
  use HTTPS where supported and avoid collecting unnecessary user data.
- Keep public claims accurate and distinguish documentation from live product
  functionality.
- `juanmackie.com/astro-site/` is the source of truth for that site's generated
  output; do not hand-edit `dist/`.
- `promptpaul.juanmackie.com/` is a standalone static site; preserve valid
  relative links and accessible HTML.

## Work guidance

- Apply `C:\Users\juanm\Documents\GitHub\Vibe Coding Rules V9.1.md` as the
  repository operating standard; read it in full before substantive work.
- Make the smallest correct change and preserve unrelated working-tree edits.
- Do not commit, push, deploy, publish, or perform destructive actions without
  explicit user authorization.

## Verification

- Astro site: `cd juanmackie.com/astro-site && npm ci && npm run build`
- Check static-site links and references after HTML or route changes.
- Inspect the final diff and confirm no secrets, generated output, or local
  configuration is included.

## Child DOX Index

- `juanmackie.com/astro-site/` — Astro portfolio site and build workflow.
- `promptpaul.juanmackie.com/` — standalone static Prompt Paul guides site.
- `audit/` — crawl/build evidence and review scripts; historical evidence is
  not source code and should not be rewritten to change past results.
