import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/blockchain-api': {
        target: 'https://blockchain.info',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/blockchain-api/, ''),
        secure: false,
      },
    },
  },
})
