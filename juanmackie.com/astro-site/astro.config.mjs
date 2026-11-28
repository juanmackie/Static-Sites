import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import path from 'node:path';
import headingOutline from './scripts/markdown/heading-outline.mjs';
import imageMeta from './scripts/markdown/image-meta.mjs';

export default defineConfig({
  site: 'https://juanmackie.com',
  trailingSlash: 'never',
  markdown: {
    processor: satteri({
      hastPlugins: [imageMeta({ publicDir: path.resolve('./public') }), headingOutline()]
    })
  }
});
