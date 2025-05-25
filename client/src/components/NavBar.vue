<template>
  <el-header class="bg-white border-b border-[#BDC3C7] shadow-lg fixed left-0 right-0 z-50 navbar-header" :class="{ 'navbar-hidden': isNavbarHidden }">
    <div class="container mx-auto px-4">
      <div class="h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 text-xl font-bold text-primary group">
          <scissors-icon :size="32" class="text-accent transform group-hover:rotate-45 transition-transform duration-300" />
          <span class="group-hover:text-accent transition-colors text-xl md:text-2xl font-black">Tailorly</span>
        </router-link>

        <div class="hidden lg:flex items-center gap-8">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="relative text-text-muted hover:text-primary transition-colors py-2 group"
          >
            {{ item.label }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
          </router-link>
          
          <div class="flex items-center gap-4">
            <el-button 
              plain
              @click="$router.push('/login')"
              class="hover:border-accent hover:text-accent transition-colors"
            >
              Sign In
            </el-button>
            <el-button 
              type="primary" 
              @click="$router.push('/register')"
              class="bg-primary hover:bg-primary-light transition-colors"
            >
              Get Started
            </el-button>
            <el-button 
              type="success" 
              @click="$router.push('/admin')"
              class="bg-success hover:bg-success-light transition-colors"
            >
              Admin Panel
            </el-button>
          </div>
        </div>

        <!-- Mobile menu button removed - handled by MobileMenu component -->
      </div>
    </div>

    <!-- Drawer removed - mobile navigation handled by MobileMenu component -->
  </el-header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  ScissorsIcon, 
  MenuIcon, 
  HomeIcon,
  RulerIcon,
  UsersIcon,
  InfoIcon,
  UserIcon,
  PlusCircleIcon,
  SettingsIcon
} from 'lucide-vue-next'

const drawer = ref(false)
const isNavbarHidden = ref(false)
const lastScrollTop = ref(0)
const scrollThreshold = 30 // Reduced threshold for more responsive behavior

// Handle scroll events to hide/show navbar
const handleScroll = () => {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  
  // Always show navbar at the top of the page
  if (currentScrollTop < 50) {
    isNavbarHidden.value = false
    lastScrollTop.value = currentScrollTop
    return
  }
  
  // Determine scroll direction and distance
  if (Math.abs(lastScrollTop.value - currentScrollTop) <= scrollThreshold) return
  
  // Hide navbar when scrolling down, show when scrolling up
  if (currentScrollTop > lastScrollTop.value) {
    // Scrolling down
    isNavbarHidden.value = true
  } else {
    // Scrolling up
    isNavbarHidden.value = false
  }
  
  lastScrollTop.value = currentScrollTop
}

// Add and remove scroll event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const menuItems = [
  { 
    label: 'Home', 
    path: '/',
    icon: HomeIcon
  },
  { 
    label: 'Measurements', 
    path: '/measurements',
    icon: RulerIcon
  },
  { 
    label: 'Find Tailors', 
    path: '/tailors',
    icon: UsersIcon
  },
  { 
    label: 'About Us', 
    path: '/about',
    icon: InfoIcon
  }
]
</script>

<style scoped>
/* Mobile menu enhancements */
.mobile-menu :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: #f9f9f9;
}

.mobile-menu :deep(.el-drawer__body) {
  padding: 0;
}

.mobile-menu :deep(.el-drawer__close-btn) {
  font-size: 20px;
  margin-right: 8px;
}

/* Mobile header improvements */
.el-header {
  height: auto !important;
  min-height: 64px;
  padding: 0;
  background-color: white;
}

/* Mobile menu items */
.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  text-decoration: none;
}

.mobile-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: #2C3E50;
}

.active-menu-item {
  background-color: rgba(44, 62, 80, 0.08);
  color: #2C3E50;
  font-weight: 600;
}

.menu-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  border-radius: 10px;
  background-color: rgba(44, 62, 80, 0.06);
  color: #2C3E50;
}

.active-menu-item .menu-icon-container {
  background-color: #2C3E50;
  color: white;
}

/* Action buttons container */
.action-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #edf2f7;
}

/* Mobile action buttons */
.mobile-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  padding: 0 20px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.signin-button {
  background-color: #f8fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.signin-button:hover {
  background-color: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.primary-button {
  background-color: #2C3E50;
  color: white;
}

.primary-button:hover {
  background-color: #34495E;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
}

.admin-button {
  background-color: #10b981;
  color: white;
}

.admin-button:hover {
  background-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Stylish mobile menu toggle button */
.mobile-menu-toggle {
  width: 48px;
  height: 48px;
  background-color: #2C3E50;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 10px rgba(44, 62, 80, 0.2);
}

.mobile-menu-toggle:hover {
  background-color: #34495E;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(44, 62, 80, 0.3);
}

.mobile-menu-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(44, 62, 80, 0.2);
}

.menu-icon {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}

.menu-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: white;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.menu-icon span:nth-child(1) {
  top: 0px;
}

.menu-icon span:nth-child(2) {
  top: 8px;
}

.menu-icon span:nth-child(3) {
  top: 16px;
}

/* Navbar fixed positioning with animation */
.navbar-header {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(0);
  top: 0;
  will-change: transform;
}

/* Hide navbar when scrolling down */
.navbar-hidden {
  transform: translateY(-100%);
  box-shadow: none;
}

/* Add padding to body to prevent content from being hidden behind fixed navbar */
:deep(body) {
  padding-top: 64px;
}

/* Ensure logo is visible on mobile */
@media (max-width: 768px) {
  .navbar-header {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 0 12px !important;
    height: 70px !important;
  }
  
  :deep(body) {
    padding-top: 70px;
  }
  
  .mobile-menu :deep(.el-drawer) {
    border-radius: 16px 0 0 16px;
    overflow: hidden;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  }
  
  .mobile-menu :deep(.el-drawer__header) {
    padding: 24px;
  }
  
  .mobile-menu :deep(.el-drawer__close-btn) {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  
  .mobile-menu :deep(.el-drawer__close-btn:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>