import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/r4ck/',
  plugins: [react()],
  build: {
    // Increase the chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,

    // Rollup options for manual chunking
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
