import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Rollup options for better chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor bundle for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
})
