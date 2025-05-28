<template>
  <el-config-provider>
    <div class="min-h-screen flex flex-col app-container">
      <!-- Responsive navigation system -->
      <div class="navigation-container">
        <!-- Desktop navigation - only visible on md screens and up -->
        <nav-bar class="!hidden md:!block" />
        <!-- Mobile navigation - only visible on sm screens and down -->
        <mobile-menu class="!block md:!hidden" />  
      </div>
      <main class="flex-grow pt-16">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <app-footer />
      <mobile-feedback />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import MobileMenu from './components/MobileMenu.vue'
import MobileFeedback from './components/MobileFeedback.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import authStateService from './services/auth-state.service'
import themeService from './services/theme.service'
import './assets/css/mobile-responsive.css'
import './assets/css/element-plus-theme.css'

// Monitor theme changes for debugging
onMounted(() => {
  console.log('Current theme:', themeService.isDarkMode.value ? 'dark' : 'light');
})

const router = useRouter()
const route = useRoute()

// Session activity monitoring
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
let activityTimer = null

// Reset the activity timer
const resetActivityTimer = () => {
  if (activityTimer) clearTimeout(activityTimer)
  
  // Only set timer if authenticated
  if (authStateService.isAuthenticated.value) {
    activityTimer = setTimeout(() => {
      console.log('Session timeout due to inactivity')
      authStateService.logout()
      router.push('/login')
    }, SESSION_TIMEOUT)
  }
}

// Activity event handler
const handleUserActivity = () => {
  resetActivityTimer()
}

// Setup route guard for protected routes
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Verify authentication state is fresh
    if (authStateService.isTokenFresh()) {
      // Check if user is authenticated
      if (authStateService.isAuthenticated.value) {
        // For admin routes, check if user is admin
        if (to.meta.requiresAdmin && !authStateService.isAdmin.value) {
          // Not an admin, redirect to home
          next({ path: '/' })
        } else {
          // Authenticated and has proper role, proceed
          next()
        }
      } else {
        // Not authenticated, redirect to login
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    } else {
      // Token is not fresh or expired, redirect to login
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  } else {
    // Route doesn't require auth, proceed
    next()
  }
})

onMounted(() => {
  // Initialize auth state
  authStateService.initAuthState()
  
  // Setup activity monitoring
  window.addEventListener('mousemove', handleUserActivity)
  window.addEventListener('keydown', handleUserActivity)
  window.addEventListener('click', handleUserActivity)
  window.addEventListener('touchstart', handleUserActivity)
  
  // Start the initial timer
  resetActivityTimer()
})

onBeforeUnmount(() => {
  // Clean up event listeners
  window.removeEventListener('mousemove', handleUserActivity)
  window.removeEventListener('keydown', handleUserActivity)
  window.removeEventListener('click', handleUserActivity)
  window.removeEventListener('touchstart', handleUserActivity)
  
  // Clear the timer
  if (activityTimer) clearTimeout(activityTimer)
})
</script>

<style>
/* Navigation container styles */
.navigation-container {
  position: relative;
  width: 100%;
  z-index: 1000;
}

:root {
  /* Light theme variables - Vibrant Fashion Palette */
  --color-primary: #1E88E5; /* Vibrant Blue - modern and eye-catching */
  --color-primary-light: #42A5F5; /* Lighter blue for hover states */
  --color-accent: #FF5722; /* Vibrant Orange - creates strong visual interest */
  --color-accent-light: #FF8A65; /* Lighter orange for subtle accents */
  --color-background: #F5F7FA; /* Crisp Light Gray - clean, bright background */
  --color-card: #FFFFFF; /* Pure white for cards */
  --color-text: #263238; /* Dark Blue-Gray - for clear readability */
  --color-text-muted: #607D8B; /* Medium Blue-Gray - visible but subtle */
  --color-border: #ECEFF1; /* Very Light Blue-Gray - subtle borders */
  --color-hover: rgba(255, 87, 34, 0.1); /* Subtle orange hover effect */
  --color-shadow: rgba(30, 136, 229, 0.1); /* Soft blue shadows */
  --color-shadow-dark: rgba(30, 136, 229, 0.2); /* Deeper blue shadows */
  --color-success: #4CAF50; /* Bright Green - clearly visible success */
  --color-warning: #FFC107; /* Bright Amber - clearly visible warnings */
  --color-danger: #F44336; /* Bright Red - clearly visible errors */
  --color-info: #03A9F4; /* Light Blue - clearly visible information */
}

/* Dark theme variables - Bold Night Fashion Palette */
html.dark {
  --color-primary: #2196F3; /* Brighter Blue for dark mode visibility */
  --color-primary-light: #64B5F6; /* Even lighter blue for hover states */
  --color-accent: #FF7043; /* Brighter Orange for dark mode visibility */
  --color-accent-light: #FFAB91; /* Even lighter orange for accents */
  --color-background: #263238; /* Dark Blue-Gray - modern dark background */
  --color-card: #37474F; /* Medium Blue-Gray - visible card background */
  --color-text: #ECEFF1; /* Very Light Blue-Gray - for contrast */
  --color-text-muted: #B0BEC5; /* Light Blue-Gray - visible muted text */
  --color-border: #455A64; /* Medium-Dark Blue-Gray - visible borders */
  --color-hover: rgba(255, 112, 67, 0.2); /* More visible hover in dark mode */
  --color-shadow: rgba(33, 150, 243, 0.2); /* Visible shadows for dark mode */
  --color-shadow-dark: rgba(33, 150, 243, 0.4); /* Deeper visible shadows */
  --color-success: #66BB6A; /* Brighter Green for visibility */
  --color-warning: #FFCA28; /* Brighter Amber for visibility */
  --color-danger: #EF5350; /* Brighter Red for visibility */
  --color-info: #29B6F6; /* Brighter Blue for visibility */
}

/* Apply theme to app container */
.app-container {
  background-color: var(--color-background);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Basic element styling */
body {
  background-color: var(--color-background);
  color: var(--color-text);
}

/* Fix for navbar in dark mode */
html.dark .navbar-header {
  background-color: var(--color-card);
  border-color: var(--color-border);
}

/* Mobile menu container positioning */
.mobile-menu-container {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

/* Theme toggle positioning */
.theme-toggle-container {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

html {
  font-family: 'Inter', sans-serif;
  color: #2C3E50;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #ECF0F1;
}

::-webkit-scrollbar-thumb {
  background: #BDC3C7;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2C3E50;
}
</style>