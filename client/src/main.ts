// Import styles first to avoid FOUC (Flash of Unstyled Content)
import 'element-plus/dist/index.css'
import './index.css'
import './assets/css/admin-theme.css'
import './assets/css/element-plus-overrides.css'

// Import Vue and plugins
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'

// Create Vue app instance
const app = createApp(App)

// Initialize Pinia store before router to avoid reactivity issues
const pinia = createPinia()
app.use(pinia)

// Add plugins
app.use(router)
app.use(ElementPlus)

// Mount app when everything is ready
app.mount('#app')