// Import Vue core first to ensure proper initialization
import { createApp } from 'vue'

// Import styles
import 'element-plus/dist/index.css'
import './index.css'
import './assets/css/admin-theme.css'
import './assets/css/element-plus-overrides.css'

// Import plugins and components after Vue core
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'

// Import router last to avoid circular dependencies
import router from './router'

// Create Vue app instance
const app = createApp(App)

// Initialize Pinia store before router to avoid reactivity issues
const pinia = createPinia()

// Apply plugins in specific order
app.use(pinia)
app.use(ElementPlus)

// Apply router last
app.use(router)

// Wait for DOM to be ready before mounting
document.addEventListener('DOMContentLoaded', () => {
  // Mount app when everything is ready
  app.mount('#app')
})