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
        target: process.env.DOCKER ? 'http://api:8000' : 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
