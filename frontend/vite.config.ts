import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external connections (for Docker)
    proxy: {
      '/api': {
        // In Docker dev mode, use 'api' as hostname
        // Locally, use 'localhost'
        target: 'https://taply.kz',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
