/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/icons/*.png'],
      manifest: {
        name: 'Gestión avisos',
        short_name: 'Avisos',
        description: 'Gestión de avisos de trabajo',
        theme_color: '#3880ff',
        background_color: '#f4f5f8',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'assets/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'assets/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'assets/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'assets/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'assets/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'storage-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts'
  }
})
