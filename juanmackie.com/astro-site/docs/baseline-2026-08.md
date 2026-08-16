# Baseline — 2026-08-10

## Source

- Repository: `astro-site/`
- Framework: Astro 7, static output
- Build command: `npm run build`
- Canonical host: `https://juanmackie.com`
- Deployment target: Coolify, publish directory `dist`

## Before implementation

- Single homepage plus `/privacy` and `/404.html`
- Navigation was entirely homepage-anchor based
- Sitemap exposed only `/` and `/privacy`
- Homepage contained the project archive, writing, reading, listening, podcast, referrals, and Prompt Paul surfaces
- Last.fm used a client-visible API identifier for the public `user.getrecenttracks` endpoint

## Verification

The baseline build passed before implementation. The final build now generates 14 static routes. The Last.fm application identifier is intentionally client-visible and only requests public recent-track data; it is not treated as a server secret.

## Known baseline warning

Vite reports a chunk above 500 KB because the retained Three.js visual layer is bundled. This is expected under the chosen maximalist direction and remains a performance-budget item.

## Baseline acceptance follow-up

Lighthouse, axe, keyboard-only navigation, reduced motion, third-party-blocked behaviour, and deployed `www` redirect behaviour should be recorded against the preview/deployment environment.
