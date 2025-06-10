import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow connections from all network interfaces
    port: 5173, // Use a consistent port
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', 'framer-motion', 'rxjs']
  }
});
