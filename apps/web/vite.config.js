import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@workua/core': path.resolve(__dirname, '../../packages/core/src/index.js'),
      '@workua/store': path.resolve(__dirname, '../../packages/store/src/index.js'),
      '@workua/api': path.resolve(__dirname, '../../packages/api/src/index.js'),
      '@workua/utils': path.resolve(__dirname, '../../packages/utils/src/index.js')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.work.ua',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Referer': 'https://www.work.ua/'
        }
      }
    }
  }
})