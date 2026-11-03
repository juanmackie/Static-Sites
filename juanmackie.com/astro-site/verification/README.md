# Defensive layout checks

## Contract

Keep the current design readable at narrow widths, with long content, and at
200% text size. Do not use page-level clipping as a substitute for wrapping.
Wide data tables and code blocks may scroll inside their own container.
Menus and chat panels must remain reachable in short viewports.

Applied guidance from [Defensive CSS](https://defensivecss.dev/):

- [Grid minimum content size](https://defensivecss.dev/tip/grid-min-content-size/):
  use zero-minimum flexible tracks and let cards shrink around scrollable tables.
- [Flexbox wrapping](https://defensivecss.dev/tip/flexbox-wrapping/):
  let headings, metadata, and navigation rows wrap when space runs out.
- [Fixed grid values](https://defensivecss.dev/tip/css-grid-fixed-values/):
  cap the tracker statistic minimum at the available container width.
- [Long content](https://defensivecss.dev/tip/long-content/):
  wrap important text and identifiers. Keep intentional preview ellipses.

Artist names belong below the title in the second Last.fm track column.
Images retain their aspect ratio. Short-screen menu and chat containers scroll
without chaining vertical scroll to the page.

## Run

From `astro-site/`:

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/` in Chrome. Run `layout-check.js` with the
Chrome DevTools `evaluate_script` tool, with `format: "function"` and
`sourcePath` set to the absolute file path. Alternatively, wrap the complete
file contents in parentheses, append `()`, and run it in the browser console.

The script only runs on localhost. It throws on failure and returns a JSON
summary on success. Save the result and screenshots outside the working tree.
It displays a temporary same-origin iframe and removes it after the run.
The frame stays painted so that the browser does not throttle UI animation
callbacks. Panel checks wait for visible state, with a five-second timeout.
This is a browser check, not a shell/CI test runner. Do not run it against a
shared production session. It does not submit chat messages or follow external
links. Pages such as `/now` still load their normal third-party embeds.

Coverage:

- Every HTML route in the sitemap at 320, 768, and 1440 CSS pixels, both themes.
- Synthetic long headings, book titles, metadata, and artist names.
- Menu/chat open, scrolling, and close at 320×640 and 800×320.
- Library search with no results, then reset.
- Home, library, and tracker with 200% root text size.
- Positive controls prove detection of visible, hidden, and clipped overflow.
- A hidden-panel control and explicit open/visible assertions prevent a closed
  chat panel from passing the geometry checks.

The detector checks content boxes inside `main`, including text clipped by
ancestor overflow. It excludes deliberate horizontal scrollers and their
contents, the ellipsized model-name previews, screen-reader-only labels, and
the aria-hidden decorative wirefield. Inspect appearance, focus, keyboard scrolling, tracker search/sort,
and refresh failure separately. This does not prove Safari/Firefox behavior,
external-service availability, or live chat replies.
