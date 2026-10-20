import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps the production build portable — it works when served from
// a repo sub-path (e.g. GitHub Pages https://user.github.io/my-sweet-home/)
// as well as from a domain root, without any extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
});
