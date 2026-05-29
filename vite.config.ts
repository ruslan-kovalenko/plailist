import { fileURLToPath, URL } from 'node:url'

import mkcert from 'vite-plugin-mkcert'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert({ hosts: ['127.0.0.1', 'localhost', 'plailist.dev'] })
  ],
  resolve: {
    extensions: ['.ts', '.json', '.vue', '.scss', '.css'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  }
})
