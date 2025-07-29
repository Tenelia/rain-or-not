import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Fix for GitHub Pages: Set base path for repository deployment
      base: process.env.NODE_ENV === 'production' ? '/rain-or-not/' : '/',
      define: {
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [tailwindcss()],
      worker: {
        format: 'es',
        plugins: () => [tailwindcss()]
      }
    };
});
