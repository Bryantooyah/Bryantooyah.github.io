/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // In dev the API runs as a separate process on :3000. Proxying it under the
    // same origin means api.ts can use plain relative "/api/..." paths in both
    // dev and production (on Vercel the function is genuinely same-origin).
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    // happy-dom rather than jsdom: jsdom's CJS dependency chain (cssstyle,
    // html-encoding-sniffer) currently require()s ESM-only packages and fails
    // to load at all under Node 22.
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    // Routes are code-split, so the first assertion against a lazy page waits on
    // a cold transform of that chunk (ProjectDetail pulls in react-markdown).
    // On a warm cache that is milliseconds; on CI it is not, and the default
    // 5s test / 1s findBy timeouts are close enough to the line to flake.
    testTimeout: 15_000,
  },
});
