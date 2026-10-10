import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'date-fns/locale': path.resolve(__dirname, './node_modules/date-fns/locale/pt-BR.js'),
      'date-fns': path.resolve(__dirname, './node_modules/date-fns/format.js'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
