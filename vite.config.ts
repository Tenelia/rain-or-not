import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Fix for GitHub Pages: Set base path for repository deployment
      base: process.env.NODE_ENV === 'production' ? '/rain-or-not/' : '/',
      
      // HTTPS development server configuration
      server: {
        https: mode === 'development' ? false : undefined, // Enable HTTPS in dev if needed
        host: true,
        port: 3000,
        strictPort: false,
        headers: {
          // Security headers for development
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      
      // Preview server (for production builds)
      preview: {
        https: false, // Set to true if you have HTTPS certificates
        host: true,
        port: 4173,
        headers: {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      
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
      },
      
      // Build configuration for production
      build: {
        // Ensure HTTPS URLs in production builds
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        },
        // Source maps for production debugging (optional)
        sourcemap: false,
        // Minimize output
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production'
          }
        }
      }
    };
});
