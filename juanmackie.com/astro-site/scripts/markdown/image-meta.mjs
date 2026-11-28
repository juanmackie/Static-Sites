/**
 * Markdown images live in `public/` and are served as-is, so without declared
 * dimensions the browser reserves no space for them (layout shift) and without
 * `loading="lazy"` every image below the fold competes with the article for
 * bandwidth.
 *
 * This Sätteri hast plugin reads the real pixel size of each local image at
 * build time and writes `width`/`height`, `loading` and `decoding`. An
 * unreadable image fails the build with its path: silently shipping a broken
 * `<img>` was the previous behaviour.
 */
import path from 'node:path';
import sharp from 'sharp';

const metadataCache = new Map();

export default function imageMeta({ publicDir }) {
  // Sätteri calls this factory once per document, so each file gets a fresh
  // visitor. The metadata cache is intentionally module-level.
  return () => ({
    name: 'image-meta',
    element: {
      filter: ['img'],
      async visit(node, ctx) {
        const src = node.properties?.src;
        if (typeof src !== 'string' || !src.startsWith('/')) return;

        const { width, height } = await dimensions(path.join(publicDir, decodeURIComponent(src)));

        ctx.setProperty(node, 'width', width);
        ctx.setProperty(node, 'height', height);
        ctx.setProperty(node, 'loading', 'lazy');
        ctx.setProperty(node, 'decoding', 'async');
      }
    }
  });
}

async function dimensions(file) {
  const cached = metadataCache.get(file);
  if (cached) return cached;

  const metadata = await sharp(file)
    .metadata()
    .catch((error) => {
      throw new Error(
        `Markdown image is not a readable image file: ${file}\n` +
          `Fix or remove the reference in src/content/. Original error: ${error.message}`
      );
    });

  if (!metadata.width || !metadata.height) {
    throw new Error(`Markdown image has no readable pixel size: ${file}`);
  }

  const size = { width: metadata.width, height: metadata.height };
  metadataCache.set(file, size);
  return size;
}
