import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/12CycleWeeks/'

// https://vite.dev/config/
// Project site: https://j35t312.github.io/12CycleWeeks/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'pwa-icon.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'Shift Swap Calendar',
        short_name: 'Swap Calendar',
        description: '12-cycle shift swap schedule with reusable patterns',
        theme_color: '#aa3bff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/12CycleWeeks\/api/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
