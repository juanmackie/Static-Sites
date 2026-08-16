# Performance budget

The terminal/Three.js visual identity is intentionally retained. Dynamic work is still bounded.

## Targets

- LCP: under 2.5 seconds
- CLS: under 0.1
- INP: under 200 milliseconds
- Critical JavaScript: approximately 150 KB compressed where feasible
- Third-party services must not be required to understand the core page

## Current implementation notes

- Three.js is dynamically imported and starts only when its canvas intersects the viewport.
- Canvas rendering pauses when the document is hidden and scales motion for reduced-motion users.
- Spotify is lazy-loaded.
- Chat content is hidden until opened.
- Google Analytics is asynchronous.
- Last.fm is progressive enhancement; the page still renders without it.
- Font weights were audited: Cormorant 600, Geist 400/600/700/800, and IBM Plex Mono 400/600/700 are all referenced.

## Verification

Run Lighthouse on `/`, `/work`, and `/thesis` in both themes. Record LCP, CLS, INP, transfer size, and third-party failures after each material visual or content change.
