// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Cloudflare Pages: output static site (default for Astro)
export default defineConfig({
  output: 'static',
  build: {
    assets: '_astro',
  },
});
