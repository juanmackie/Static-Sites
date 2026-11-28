/**
 * Content checks for the built site. Run after `npm run build`:
 *
 *   npm run check:content
 *
 * The site has no test suite; these are the invariants that broke before and
 * were only visible by looking at rendered pages: broken image files, images
 * without dimensions (layout shift), heading levels that skip, and internal
 * links or anchors that no longer resolve.
 *
 * Exit code is non-zero when any check fails.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const failures = [];
const counts = { pages: 0, images: 0, headings: 0, links: 0 };

const pages = walk(DIST).filter((file) => file.endsWith('.html'));
const routeOf = (file) =>
  ('/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '')).replace(/(.)\/$/, '$1');
const routes = new Set(pages.map(routeOf));
const assets = new Set(walk(DIST).map((file) => '/' + path.relative(DIST, file)));

const IMAGE_SIGNATURES = [
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0xff, 0xd8, 0xff], // JPEG
  [0x47, 0x49, 0x46, 0x38], // GIF
  [0x52, 0x49, 0x46, 0x46] // RIFF (WebP container)
];

function isDecodableImage(file) {
  const handle = fs.openSync(file, 'r');
  const head = Buffer.alloc(12);
  try {
    fs.readSync(handle, head, 0, 12, 0);
  } finally {
    fs.closeSync(handle);
  }
  if (head.subarray(0, 4).toString('latin1') === '<svg' || head.subarray(0, 5).toString('latin1') === '<?xml') {
    return file.endsWith('.svg');
  }
  return IMAGE_SIGNATURES.some((signature) => signature.every((byte, index) => head[index] === byte));
}


for (const file of pages) {
  const route = routeOf(file) || '/';
  const html = fs.readFileSync(file, 'utf8');
  counts.pages++;

  checkHeadings(route, html);
  checkImages(route, html);
  checkLinks(route, html);
}

report();

function checkHeadings(route, html) {
  let previous = 0;
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>/g)) {
    const level = Number(match[1]);
    counts.headings++;
    if (previous && level > previous + 1) {
      failures.push(`${route}: heading skips from h${previous} to h${level}`);
    }
    previous = level;
  }
}

function checkImages(route, html) {
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const src = attr('src');
    counts.images++;
    if (!src) {
      failures.push(`${route}: <img> without src`);
      continue;
    }
    if (!attr('width') || !attr('height')) failures.push(`${route}: ${src} has no width/height`);
    if (attr('loading') !== 'lazy') failures.push(`${route}: ${src} is not loading="lazy"`);
    if (src.startsWith('/') && !assets.has(src)) failures.push(`${route}: ${src} is missing from dist`);
    else if (src.startsWith('/') && !isDecodableImage(path.join(DIST, src.slice(1)))) {
      // The archive once served 243-byte XML error documents with a .png name.
      failures.push(`${route}: ${src} is not an image file`);
    }
  }
}

function checkLinks(route, html) {
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = match[1].match(/href="([^"]*)"/)?.[1];
    counts.links++;
    const text = match[2]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (/^(here|click here|read more|learn more|link|this|more)$/i.test(text)) {
      failures.push(`${route}: link to ${href} uses non-descriptive text "${text}"`);
    }

    if (!href || !href.startsWith('/') || href.startsWith('//')) continue;

    const [rawPath, rawHash] = href.split('#');
    const clean = rawPath.split('?')[0].replace(/\/$/, '');
    const target = clean === '' ? '/' : clean;

    if (routes.has(target) || assets.has(target)) {
      if (rawHash) checkAnchor(route, target, rawHash);
      continue;
    }
    failures.push(`${route}: link ${href} does not resolve`);
  }
}

function checkAnchor(route, target, hash) {
  const targetFile = target === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${target.slice(1)}.html`);
  const candidates = [targetFile, path.join(DIST, target.slice(1), 'index.html')];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) return;
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(`id="${hash}"`) && !html.includes(`name="${hash}"`)) {
    failures.push(`${route}: anchor #${hash} is missing on ${target}`);
  }
}

function report() {
  console.log(
    `Checked ${counts.pages} pages, ${counts.headings} headings, ${counts.images} images, ${counts.links} links.`
  );
  if (failures.length === 0) {
    console.log('Content checks passed.');
    return;
  }
  console.error(`\n${failures.length} content problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
