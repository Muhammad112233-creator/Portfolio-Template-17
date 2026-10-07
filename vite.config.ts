import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build works from a GitHub Pages
// project path (username.github.io/repo) as well as from a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Allow the sandbox preview host and any tunnelled hostname during development.
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
