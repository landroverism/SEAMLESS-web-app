import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add explicit aliases for Vue packages to prevent circular dependencies
      'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.runtime.esm-bundler.js'),
      'pinia': path.resolve(__dirname, './node_modules/pinia/dist/pinia.esm-bundler.js')
    },
    // Ensure proper module resolution
    dedupe: ['vue', 'vue-router', 'pinia']
  },
  define: {
    // Fix for production mode
    '__VUE_OPTIONS_API__': true,
    '__VUE_PROD_DEVTOOLS__': false
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
        // Ensure proper code splitting
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'pinia': ['pinia'],
          'element-plus': ['element-plus'],
          'chart': ['chart.js']
        },
        // Prevent chunk invalidation
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Use esbuild minifier
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
    include: ['vue', 'vue-router', 'pinia', 'element-plus'],
    // Force optimization of these dependencies
    force: true
  },
  // Prevent dev server issues
  server: {
    fs: {
      strict: false
    }
  }
})