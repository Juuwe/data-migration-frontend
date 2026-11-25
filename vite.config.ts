import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const base = isGitHubPages ? '/data-migration-frontend/' : '/'
// В нативной сборке service worker не нужен: он кэширует старый бандл,
// из-за чего после пересборки WebView показывает устаревший интерфейс.
const isTauriBuild = process.env.npm_lifecycle_event === 'build:tauri'
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8081'
const s3Target = process.env.S3_PROXY_TARGET ?? 'http://localhost:9010'

// https://vite.dev/config/
export default defineConfig({
  base,
  server: {
    port: 3000,
    proxy: {
      // Бэкенд домена услуг: снимает ограничение CORS.
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        timeout: 3000,
        proxyTimeout: 3000,
      },
      // Второй маршрут для объектов MinIO (изображения и видео).
      '/s3': {
        target: s3Target,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
      },
    },
  },
  plugins: [
    react(),
    ...(isTauriBuild
      ? []
      : [
          VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'images/default.svg',
        'videos/default.mp4',
      ],
      manifest: {
        id: base,
        name: 'Миграция данных',
        short_name: 'Миграция',
        description: 'Каталог методов миграции данных и прогноз времени переноса',
        lang: 'ru',
        theme_color: '#2a9fff',
        background_color: '#f6f8fb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
        workbox: {
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        },
      }),
    ]),
  ],
})
