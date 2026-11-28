/**
 * Essays migrated from Substack use `####` and `#####` as the second and third
 * level of subheading, so the rendered outline jumps from the article `h1`
 * straight to `h4`. Outline tools and screen readers report the skip, and
 * prose CSS that styles only `h1`-`h4` leaves `h5` at browser defaults.
 *
 * This Sätteri hast plugin maps each original depth onto the shallowest depth
 * that keeps a valid outline, keeps the relative order of headings, and
 * records the original depth in `data-depth` so the stylesheet can keep the
 * visual rank. The article title is always the page `h1`, so content headings
 * never go above `h2`.
 */
export default function headingOutline() {
  // One factory call per document: the depth state must not leak between files.
  return () => {
    let lastEmitted = 1;
    const emittedByDepth = new Map();

    return {
      name: 'heading-outline',
      element: {
        filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        visit(node, ctx) {
          const depth = Number(node.tagName[1]);
          let emitted = emittedByDepth.get(depth);

          if (emitted === undefined) {
            emitted = Math.min(depth, lastEmitted + 1);
            for (const knownDepth of emittedByDepth.keys()) {
              if (knownDepth > depth) emittedByDepth.delete(knownDepth);
            }
          }

          emitted = Math.max(2, Math.min(6, emitted));
          emittedByDepth.set(depth, emitted);
          lastEmitted = emitted;

          if (emitted === depth) return;

          ctx.replaceNode(node, {
            ...node,
            tagName: `h${emitted}`,
            properties: { ...node.properties, dataDepth: String(depth) }
          });
        }
      }
    };
  };
}
