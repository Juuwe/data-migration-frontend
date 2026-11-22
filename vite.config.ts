import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // Бэкенд домена услуг: снимает ограничение CORS.
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        timeout: 3000,
        proxyTimeout: 3000,
      },
      // Второй маршрут для объектов MinIO (изображения и видео).
      '/s3': {
        target: 'http://localhost:9010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
      },
    },
  },
  plugins: [react()],
})
