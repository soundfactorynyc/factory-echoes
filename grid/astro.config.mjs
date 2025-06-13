// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  
  build: {
    inlineStylesheets: 'auto',
  },
  
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild'
    },
    
    optimizeDeps: {
      include: ['nanostores', '@nanostores/persistent']
    }
  },
  
  server: {
    port: 4321,
    host: true,
  },
  
  trailingSlash: 'never',
  compressHTML: true
});
