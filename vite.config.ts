// // vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Avoid CORS in dev: browser calls same origin (e.g. /api/v1/...), Vite forwards to backend
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true,
      },
    },
  },
})
