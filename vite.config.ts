import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/refook_v3/',
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api.refook.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
        secure: false,
        configure: (proxy, options) => {
          console.log("Options: ", options)
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err, req, res);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url, res, proxyReq);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url, res);
          });
        },
      }
    }
  }
})
