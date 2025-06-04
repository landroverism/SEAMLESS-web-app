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
    // Fix circular dependency issues
    commonjsOptions: {
      strictRequires: true
    },
    // Improve chunking strategy
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create separate chunks for large dependencies
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/vue-router') || 
              id.includes('node_modules/pinia')) {
            return 'vue-vendor'
          }
          if (id.includes('node_modules/chart.js')) {
            return 'chart'
          }
        }
      }
    },
    // Use esbuild minifier instead of terser
    minify: 'esbuild',
    target: 'es2015',
  },
  // Ensure CSS is properly processed
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/css/variables.scss" as *;`
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus']
  }
})