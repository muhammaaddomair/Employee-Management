import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  root: path.resolve(__dirname, 'renderer'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'renderer/src'),
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-renderer'),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
