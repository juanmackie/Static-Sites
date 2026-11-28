/**
 * Essay illustrations were exported from Substack at full size: one PNG was
 * 3.1 MB at 1792x1024. They are served from `public/`, so no framework
 * optimisation applies.
 *
 * This script converts every essay raster to WebP at a bounded width, rewrites
 * the Markdown references, and deletes the original. Run it after adding an
 * essay with a large illustration:
 *
 *   npm run optimize:images
 *
 * It is idempotent: WebP files already under the size ceiling are left alone,
 * and a repeat run rewrites any reference a previous run missed. Pass
 * `--dry-run` to see the conversions without writing.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMAGE_DIR = 'public/writing';
const CONTENT_DIR = 'src/content/writing';
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const MAX_WIDTH = 1600;
const QUALITY = 82;
// Pre-existing WebP files are left alone unless they are far heavier than the
// rest of the archive; those are re-encoded once and stay below the threshold.
const RECHECK_BYTES = 400 * 1024;
const RECHECK_WIDTH = 1200;
const RECHECK_QUALITY = 76;
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const markdownFiles = (await fs.readdir(CONTENT_DIR)).filter((name) => name.endsWith('.md'));
  const sources = await collectRasters(IMAGE_DIR);
  const unreadable = [];
  let converted = 0;

  for (const source of sources) {
    const isWebp = path.extname(source).toLowerCase() === '.webp';
    const before = (await fs.stat(source)).size;
    const metadata = await sharp(source)
      .metadata()
      .catch(() => null);

    if (!metadata?.width) {
      unreadable.push(source);
      console.error(`unreadable ${publicUrl(source)} (${before} B): not a decodable image. Remove the reference.`);
      continue;
    }

    if (isWebp && before <= RECHECK_BYTES) continue;

    const target = isWebp ? source : source.replace(/\.(png|jpe?g)$/i, '.webp');
    const width = isWebp ? Math.min(RECHECK_WIDTH, metadata.width) : Math.min(MAX_WIDTH, metadata.width);
    const quality = isWebp ? RECHECK_QUALITY : QUALITY;

    if (dryRun) {
      const preview = await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
      report(source, before, preview.length, metadata.width, width);
      continue;
    }

    const temporary = `${target}.tmp`;
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(temporary);
    await fs.rename(temporary, target);
    if (!isWebp) await fs.rm(source);
    converted++;
    report(source, before, (await fs.stat(target)).size, metadata.width, width, true);
  }

  // Also rewrite references left pointing at a raster that a previous,
  // interrupted run already converted, so repeat runs converge.
  const renames = new Map();
  for (const file of markdownFiles) {
    const markdown = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8');
    for (const match of markdown.matchAll(/\/writing\/[^)\s]+\.(?:png|jpe?g)\b/gi)) {
      const target = match[0].replace(/\.(png|jpe?g)$/i, '.webp');
      const sourceExists = await exists(path.join('public', match[0].slice(1)));
      if (!sourceExists && (await exists(path.join('public', target.slice(1))))) {
        renames.set(match[0], target);
      }
    }
  }

  let rewritten = 0;
  for (const file of markdownFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const original = await fs.readFile(filePath, 'utf8');
    let next = original;
    for (const [from, to] of renames) next = next.split(from).join(to);
    if (next === original) continue;
    if (!dryRun) await fs.writeFile(filePath, next);
    rewritten++;
  }

  console.log(`\n${dryRun ? 'would convert' : 'converted'} ${converted} image(s), ${rewritten} Markdown file(s) updated.`);
  if (dryRun) console.log('Dry run: nothing written.');
  if (unreadable.length) {
    console.error(`\n${unreadable.length} unreadable image(s) still referenced. Remove those references.`);
    process.exitCode = 1;
  }
}

async function exists(file) {
  return fs
    .access(file)
    .then(() => true)
    .catch(() => false);
}

function publicUrl(file) {
  return '/' + path.relative('public', file).split(path.sep).join('/');
}

function report(source, before, after, fromWidth, toWidth, done = false) {
  const saved = Math.round((1 - after / before) * 100);
  console.log(
    `${done ? 'converted' : 'would convert'} ${path.basename(path.dirname(source))}/${path.basename(source)} ` +
      `${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB (-${saved}%), ` +
      `${fromWidth}px -> ${toWidth}px`
  );
}

async function collectRasters(dir) {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collectRasters(full)));
    else if (RASTER.has(path.extname(entry.name).toLowerCase())) found.push(full);
  }
  return found.sort();
}

await main();
