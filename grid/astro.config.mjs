// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'three', 'framer-motion', 'rxjs']
    }
  }
});
