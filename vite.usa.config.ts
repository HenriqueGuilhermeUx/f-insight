import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only the static US preview entrypoint; never build the Brazilian app or public/PWA assets.
const repo = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  root: resolve(repo, 'usa-preview'),
  publicDir: resolve(repo, 'usa-preview/public'),
  base: '/',
  build: { outDir: resolve(repo, 'dist-usa-finsight'), emptyOutDir: true },
});
