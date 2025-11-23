import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'favicon.png', 'robots.txt', 'logo.svg', 'logo.png', 'banner.png'],
          manifest: {
            name: 'AI Tafsir - Quran Research',
            short_name: 'AI Tafsir',
            description: 'AI-powered Quran reading and research application',
            theme_color: '#10b981',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            id: '/',
            start_url: '/',
            scope: '/',
            lang: 'en',
            dir: 'ltr',
            categories: ['education', 'reference', 'religion'],
            icons: [
              {
                src: 'android/android-launchericon-192-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'android/android-launchericon-512-512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'android/android-launchericon-512-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            screenshots: [
              {
                src: 'banner.png',
                sizes: '1024x500',
                type: 'image/png',
                form_factor: 'wide',
                label: 'AI Tafsir Home Screen'
              },
              {
                src: 'banner.png',
                sizes: '1024x500',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'AI Tafsir Mobile View'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-cache',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365
                      },
                      cacheableResponse: {
                        statuses: [0, 200]
                      }
                    }
                },
                {
                    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'gstatic-fonts-cache',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365
                      },
                      cacheableResponse: {
                        statuses: [0, 200]
                      }
                    }
                }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'genai': ['@google/genai'],
              'markdown': ['react-markdown']
            }
          }
        }
      }
    };
});
