# UI/UX Punchlist Fix Plan

> **Status: ✅ COMPLETE** — all items implemented and verified (build passes, greps on `dist/` confirm, preview smoke test 200s).

Scope: fix the P0 bugs, high-value P1 UX problems, and cheap P2 polish items identified in the review, then verify with a production build.

## P0 — Bugs

### 1. Glued hero text (`src/pages/index.astro`)
- Split the corrupted `.display__support` run into two proper sentences:
  - *"A living index of projects, essays, books, music, and ideas worth returning to."*
  - *""AI will do to the human mind, what the bicycle did for human movement.""*
- Add spacing between stacked `.display__support` paragraphs in `src/styles/global.css`.

### 2. Internal anchors opening in new tabs (`src/pages/index.astro`)
- Add an `isExternal(href)` helper in the frontmatter.
- Project cards render `target="_blank"` + `rel="noreferrer"` **only for external URLs** — the internal `#reading` and `#podcast` cards will no longer spawn duplicate tabs.

### 3 + 12. Dead/joke projects (`src/data/site.ts`)
- SuretyDoc: category `Production` → `Retired`, remove the Rickroll YouTube href (rendered as a non-link card).
- Storybloom.xyz: category `Production` → `Deprecated`.
- Index page project cards handle an empty `href` (render a `<div class="project-card project-card--plain">` instead of an `<a>`), with hover affordance suppressed.

### 4. Blank page without JS (`src/layouts/BaseLayout.astro` + `src/styles/global.css`)
- Head inline script adds `document.documentElement.classList.add('js')` before first paint.
- `.reveal` hidden state gated behind `html.js .reveal` — no-JS users see all content.
- `<noscript>` style fallback forces `.reveal` visible as belt-and-braces.

### 5. Mobile menu focus loss (`src/components/Nav.astro`)
- On close, focus the menu toggle button (currently focuses `.site-nav__email`, which is `display: none` ≤960px → keyboard focus vanishes).

### 6. Last.fm false "offline" state (`src/components/LastFm.astro`)
- Initial markup shows "Loading / Fetching stream…" instead of "Offline / Currently offline" before the first fetch resolves.

## P1 — UX problems

### 7. "Listening" section mismatch (`src/pages/index.astro`)
- Add `<LastFm variant="section" />` (the component already ships this variant, currently unused) into the `#listening` section; shrink the "Elsewhere" card from `bento__span-12` → `bento__span-7`. Section heading ("What is playing, and where I keep going") now matches its content.

### 8. Reading list affordance (`src/styles/global.css`)
- Remove hover lift/3D tilt on non-interactive `.reading-grid li` so they stop looking clickable (257 items; linking them to Goodreads is out of scope).

### 9. Chat widget gaps (`src/components/ChatWidget.astro` + CSS)
- `aria-live="polite"` on the messages container.
- Animated typing indicator bubble while awaiting the webhook.
- Input + send button disabled while pending (no double-send).
- Escape closes the widget; focus returns to the toggle.

### 10. Contrast fixes (`src/styles/global.css`)
- Add `--accent-ink` token (dark `#9c360f`, light `#b33f00`) for accent text on cream paper; use it for `.hero__identity .eyebrow` and `.hero__identity .hero__meta span` (currently orange-on-cream ≈ 2.2:1, fails WCAG AA).
- Bump `--subtle` opacity: dark `0.45` → `0.6`, light `0.48` → `0.62` (small mono labels ≈ 3.4:1 → ≈ 4.8–5.6:1).

### 11. SVG og:image / apple-touch-icon (`src/layouts/BaseLayout.astro` + new files)
- ✅ Generated `public/og-image.png` (1200×630) and `public/apple-touch-icon.png` (180×180) from the SVGs via headless Chrome; pixels verified programmatically.
- Point `og:image`, `twitter:image` → `/og-image.png`; `apple-touch-icon` → `/apple-touch-icon.png`.

## P2 — Polish

- **13. Theme toggle mobile label**: cryptic "T" → `◐` glyph (aria-label already present).
- **14. Hero meta labels**: hardcoded index-mapped array → `tag` field on `socials` entries in `src/data/site.ts`, rendered directly.
- **15. Referral pill labels**: trim the three longest (`Buffer`, `Railway.app`, `OVO Energy (EV Plan)`).
- **16. Project card hover jump**: remove `padding-inline: 0.8rem` on hover (translateX hover stays).
- **17. 404 arrow**: "Back home" ↓ → ←.
- **18. Focus-visible coverage**: add `.principle-trigger`, `.principle-modal__close`, `.hero__meta a` to the custom focus ring list.
- **19. Deprecated iframe attrs**: drop `frameborder` / `scrolling`.
- **20. theme-color meta**: updates with the active theme (dark `#030303` / light `#e5dcc9`) in both the head script and the nav theme toggle.

## Tech debt (cheap wins only)

- **22. Principles de-duplicated**: move the array to `src/data/site.ts`, import it in the index frontmatter and the client script (no more copy-paste drift).
- **24. Font weight trim** (if grep shows unused weights): cut unloaded weights from the Google Fonts URL.

## Intentionally deferred (documented, not touched)

- CSS consolidation of the three stacked design layers (~3,125 lines) — high regression risk without visual tooling.
- `tmp-new-site-snapshot.txt` — retained locally but ignored; not referenced by the build.
- Full reading-list search/filter feature.

## Verification

1. ✅ `npm run build` — succeeds, 14 pages built.
2. ✅ Grep `dist/index.html`: no "returning to.AI"; `#reading`/`#podcast` cards have no `target="_blank"`; "Fetching the stream…" present; `og-image.png` referenced; listening section renders `listening-widget--section bento__span-5` + `bento__span-7` Elsewhere card.
3. ✅ Grep built CSS: `html.js .reveal` gating, `--accent-ink`, `chatTyping` keyframes, `◐` glyph all present.
4. ✅ No `dQw4w9WgXcQ` anywhere in `dist/`.
5. ✅ Preview smoke test: `/`, `/privacy`, `/404.html`, `/og-image.png`, `/apple-touch-icon.png`, `/robots.txt`, `/sitemap.xml` all 200.
