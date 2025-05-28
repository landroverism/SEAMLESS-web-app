<template>
  <div class="mobile-navigation fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-background shadow-md md:!hidden">
    <!-- Tailorly Logo for mobile -->
    <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-primary">
      <scissors-icon :size="24" class="text-accent" />
      <span class="text-accent text-lg font-black">Tailorly</span>
    </router-link>
    
    <!-- Mobile controls: hamburger menu only -->
    <div class="mobile-header-controls">
      <button 
        class="mobile-menu-button bg-accent hover:bg-accent-light rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-300"
        @click="toggleMenu"
        aria-label="Toggle menu"
      >
        <span class="sr-only">Menu</span>
        <div class="hamburger-icon" :class="{ 'is-active': isMenuOpen }">
          <span class="bg-white"></span>
          <span class="bg-white"></span>
          <span class="bg-white"></span>
        </div>
      </button>
    </div>
    
    <!-- Mobile slide-in menu with backdrop blur -->
    <div 
      class="mobile-menu"
      :class="{ 'is-active': isMenuOpen }"
      @click="closeMenu"
    >
      <div 
        class="menu-content"
        :class="{ 'is-active': isMenuOpen }"
        @click.stop
      >
        <div class="menu-header">
          <h2 class="menu-title">Tailorly</h2>
          <button @click="closeMenu" class="close-button" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <nav class="menu-nav">
          <ul>
            <li v-for="item in menuItems" :key="item.path" class="menu-item">
              <router-link 
                :to="item.path" 
                class="menu-link"
                @click="closeMenu"
                active-class="active"
              >
                <span class="menu-text">{{ item.label }}</span>
              </router-link>
            </li>
            
            <!-- Auth buttons when not authenticated -->
            <template v-if="!isAuthenticated">
              <li class="menu-item">
                <router-link 
                  to="/login" 
                  class="menu-link"
                  @click="closeMenu"
                >
                  <span class="menu-text">Sign In</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link 
                  to="/register" 
                  class="menu-link cta-link"
                  @click="closeMenu"
                >
                  <span class="menu-text">Get Started</span>
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/auth.service';

const router = useRouter();
const isMenuOpen = ref(false);
const isAuthenticated = ref(false);

// Menu items
const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Measurements', path: '/measurements' },
  { label: 'Find Tailors', path: '/tailors' },
  { label: 'About Us', path: '/about' }
];

// Toggle menu open/close
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
}

// Close menu
function closeMenu() {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
}

// Check authentication status on mount
onMounted(() => {
  checkAuth();
});

// Check authentication status
async function checkAuth() {
  try {
    const authState = await authService.getAuthState();
    isAuthenticated.value = authState.isAuthenticated;
  } catch (error) {
    console.error('Auth check error:', error);
    isAuthenticated.value = false;
  }
}
</script>

<style scoped>
.mobile-navigation {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 50;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.mobile-header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Enhanced mobile menu button styles */
.mobile-menu-button {
  position: relative;
  z-index: 50;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mobile-menu-button:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hamburger-icon {
  width: 18px;
  height: 14px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}

.hamburger-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: var(--color-text-muted);
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
  background-color: #F5EFE7;
}

.hamburger-icon span:nth-child(1) {
  top: 0px;
}

.hamburger-icon span:nth-child(2) {
  top: 6px;
}

.hamburger-icon span:nth-child(3) {
  top: 12px;
}

.hamburger-icon.is-active span:nth-child(1) {
  top: 6px;
  transform: rotate(135deg);
}

.hamburger-icon.is-active span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.hamburger-icon.is-active span:nth-child(3) {
  top: 6px;
  transform: rotate(-135deg);
}

/* Mobile menu styling */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-menu.is-active {
  opacity: 1;
  visibility: visible;
}

.menu-content {
  position: fixed;
  top: 0;
  right: -300px;
  width: 280px;
  height: 100%;
  background-color: var(--color-card);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  overflow-y: auto;
  z-index: 45;
}

.menu-content.is-active {
  right: 0;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.menu-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-hover);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--color-border);
}

.menu-nav {
  padding: 1rem 0;
}

.menu-item {
  margin: 0.25rem 0;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.menu-link:hover, .menu-link.active {
  background-color: var(--color-hover);
  color: var(--color-primary);
}

.menu-text {
  font-size: 1rem;
  font-weight: 500;
}

.cta-link {
  margin: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white !important;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 4px var(--color-shadow);
  transition: all 0.3s ease;
}

.cta-link:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px var(--color-shadow);
}
</style>
