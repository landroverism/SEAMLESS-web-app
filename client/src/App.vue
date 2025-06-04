<template>
  <el-config-provider>
    <div class="min-h-screen flex flex-col app-container bg-papaya-whip">
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
import './assets/css/navbar-enhanced.css'
import './assets/css/admin-sidebar.css'
import './assets/css/element-plus-overrides.css' // Override for dark backgrounds in dropdowns

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
  /* Light theme variables - Updated Color Palette */
  --color-primary: #2E3A3F; /* Soft Black for text & dropdown */
  --color-primary-light: #3A474D; /* Slightly lighter version of Soft Black */
  --color-accent: #FBBF24; /* Star Yellow - accent color */
  --color-accent-light: #FCD34D; /* Lighter version of Star Yellow */
  --color-background: #FFFFFF; /* Background White */
  --color-card: #FFFFFF; /* Pure white for cards */
  --color-text: #2E3A3F; /* Soft Black for text */
  --color-text-muted: #AEB5BA; /* Placeholder Grey */
  --color-border: #E5E7EB; /* Border Light Grey */
  --color-hover: rgba(251, 191, 36, 0.1); /* Subtle yellow hover effect */
  --color-shadow: rgba(46, 58, 63, 0.1); /* Soft shadows */
  --color-shadow-dark: rgba(46, 58, 63, 0.2); /* Deeper shadows */
  --color-success: #4CAF50; /* Keeping success color */
  --color-warning: #FBBF24; /* Using Star Yellow for warnings */
  --color-danger: #F44336; /* Keeping danger color */
  --color-info: #E0F6F2; /* Muted Cyan */
}

/* Dark theme variables - Keeping dark theme with adjustments to match new palette */
html.dark {
  --color-primary: #2E3A3F; /* Soft Black */
  --color-primary-light: #3A474D; /* Slightly lighter version of Soft Black */
  --color-accent: #FBBF24; /* Star Yellow */
  --color-accent-light: #FCD34D; /* Lighter version of Star Yellow */
  --color-background: #1A1D20; /* Dark background */
  --color-card: #2E3A3F; /* Soft Black for cards */
  --color-text: #FFFFFF; /* White text for contrast */
  --color-text-muted: #AEB5BA; /* Placeholder Grey */
  --color-border: #E5E7EB; /* Border Light Grey */
  --color-hover: rgba(251, 191, 36, 0.2); /* More visible hover in dark mode */
  --color-shadow: rgba(251, 191, 36, 0.2); /* Visible shadows for dark mode */
  --color-shadow-dark: rgba(251, 191, 36, 0.4); /* Deeper visible shadows */
  --color-success: #4CAF50; /* Keeping success color */
  --color-warning: #FBBF24; /* Using Star Yellow for warnings */
  --color-danger: #F44336; /* Keeping danger color */
  --color-info: #E0F6F2; /* Muted Cyan */
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