import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        billing: resolve(import.meta.dirname, 'billing.html'),
        rates: resolve(import.meta.dirname, 'rates.html')
      }
    }
  }
});
