import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimize build for production
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Improve chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'chart': ['chart.js'],
        }
      }
    }
  },
  // Ensure CSS is properly processed
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/css/variables.scss" as *;`
      }
    }
  }
})