# Juan Mackie site

Astro rebuild of the current Carrd site.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm audit --omit=dev --audit-level=high
```

## Coolify

- Source: GitHub repo
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Canonical domain: `juanmackie.com`
- Redirect: `www.juanmackie.com` -> `juanmackie.com`

Before deployment, verify the redirect from the raw response:

```bash
curl -I https://www.juanmackie.com
curl -I https://juanmackie.com/sitemap.xml
```

The site now includes `/work`, case files under `/work/*`, `/thesis`, `/method`, `/direction`, `/writing`, and `/about`.

## Content and proof discipline

Project status and evidence stages live in `src/data/site.ts`. Read `docs/claim-rules.md` before publishing fire-protection claims. `[CONFIRM]` markers identify role, permission, or metric copy that needs Juan's review.

The Last.fm API identifier is intentionally client-visible: the site only requests public recent-track data through `user.getrecenttracks`. It is not a server credential.

All `PUBLIC_*` values are embedded into the static HTML and must therefore contain public configuration only — never secrets or credentials. Analytics is opt-in. The chat control remains visible as an email fallback when no valid HTTPS webhook URL is configured; live chat sends only to that configured public endpoint. The chat service remains responsible for server-side input validation, rate limiting, and retention controls.

## Verification checklist

```bash
npm run build
npm audit --omit=dev --audit-level=high
npm run preview
```

Test desktop/mobile, dark/light themes, reduced motion, keyboard navigation, blocked third-party services, all sitemap routes, and the direct email links before deployment. External deployment requires explicit approval.

## Optional environment variables

- `PUBLIC_GA_ID`
- `PUBLIC_UMAMI_SRC`
- `PUBLIC_UMAMI_WEBSITE_ID`
- `PUBLIC_CHAT_WEBHOOK_URL`
- `PUBLIC_CHAT_ROUTE`
- `PUBLIC_LASTFM_USERNAME`
- `PUBLIC_LASTFM_API_KEY`
