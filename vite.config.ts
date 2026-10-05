import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import aiHandler from './api/ai.ts';

function parkwiseAiApiPlugin(): Plugin {
  return {
    name: 'parkwise-ai-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ai', (req, res) => {
        aiHandler(req, res).catch((err) => {
          console.error('[ParkWise AI Middleware Error]:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server proxy error' }));
          }
        });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai', (req, res) => {
        aiHandler(req, res).catch((err) => {
          console.error('[ParkWise AI Preview Middleware Error]:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server proxy error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GROQ_API_KEY && !process.env.GROQ_API_KEY) {
    process.env.GROQ_API_KEY = env.GROQ_API_KEY;
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      parkwiseAiApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'ParkWise AI',
        short_name: 'ParkWise',
        description: 'AI-Powered Parking Discovery - Find parking, park smarter.',
        theme_color: '#111827',
        background_color: '#F8F9FA',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
};
});
