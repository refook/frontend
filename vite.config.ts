import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/refook_v3/',
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://82.146.39.131:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
        secure: false
      }
    }
  }
})
