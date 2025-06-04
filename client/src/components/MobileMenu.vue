<template>
  <div class="mobile-navigation fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-white shadow-sm md:!hidden border-b border-[#EEEEEE]">
    <!-- Tailorly Logo for mobile -->
    <router-link to="/" class="flex items-center gap-2 text-xl font-bold">
      <scissors-icon :size="24" class="text-[#D4AF37]" />
      <span class="text-[#D4AF37] text-lg font-black">Tailorly</span>
    </router-link>
    
    <!-- Mobile controls: hamburger menu only -->
    <div class="mobile-header-controls">
      <button 
        class="mobile-menu-button bg-[#F5F5F5] hover:bg-[#EEEEEE] rounded-full w-10 h-10 flex items-center justify-center shadow-sm transition-all duration-300"
        @click="toggleMenu"
        aria-label="Toggle menu"
      >
        <span class="sr-only">Menu</span>
        <div class="hamburger-icon" :class="{ 'is-active': isMenuOpen }">
          <span class="bg-[#D4AF37]"></span>
          <span class="bg-[#D4AF37] w-3/4"></span>
          <span class="bg-[#D4AF37]"></span>
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
          <h2 class="menu-title">
            <span class="text-[#D4AF37]">Tailorly</span>
            <span class="text-[#A78C5F] text-sm ml-2">Premium Tailoring</span>
          </h2>
          <button @click="closeMenu" class="close-button" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <li class="menu-item mt-4">
                <router-link 
                  to="/register" 
                  class="menu-link cta-link bg-[#D4AF37] hover:bg-[#E5C158] text-[#1C1B1F]"
                  @click="closeMenu"
                >
                  <span class="menu-text font-bold">Get Started</span>
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
        
        <!-- Decorative element -->
        <div class="menu-decoration">
          <div class="gold-accent"></div>
        </div>
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
  left: 0;
  width: 100%;
  z-index: 50;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1C1B1F; /* Deep charcoal black */
  border-bottom: 1px solid #3D3A42;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  background-color: #252429; /* Slightly lighter charcoal */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.mobile-menu-button:hover {
  background-color: #2A292E; /* Slightly lighter */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
  background-color: #D4AF37; /* Gold accent */
}

.hamburger-icon span:nth-child(1) {
  top: 0px;
  width: 100%;
}

.hamburger-icon span:nth-child(2) {
  top: 6px;
  width: 75%;
}

.hamburger-icon span:nth-child(3) {
  top: 12px;
  width: 100%;
}

.hamburger-icon.is-active span {
  width: 100%;
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
  background-color: rgba(0, 0, 0, 0.7);
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
  background-color: #FFFFFF; /* White background */
  border-left: 1px solid #EEEEEE;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
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
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #EEEEEE;
  background-color: #F8F8F8; /* Light gray for subtle contrast */
}

.menu-title {
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(212, 175, 55, 0.1); /* Gold with opacity */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(212, 175, 55, 0.2);
  transform: rotate(90deg);
}

.menu-nav {
  padding: 1rem 0;
}

.menu-item {
  margin: 0.5rem 0;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.5rem;
  color: #FFFFFF; /* White text */
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-left: 0px solid #D4AF37; /* Gold accent */
}

.menu-link:hover, .menu-link.active {
  background-color: #252429; /* Slightly lighter charcoal */
  color: #D4AF37; /* Gold accent */
  border-left: 4px solid #D4AF37;
  padding-left: calc(1.5rem - 4px);
}

.menu-text {
  font-size: 1rem;
  font-weight: 500;
}

.cta-link {
  margin: 1rem 1.5rem;
  background-color: #D4AF37; /* Gold accent */
  color: #1C1B1F !important; /* Dark text on gold */
  border-radius: 8px;
  padding: 0.75rem 1.25rem !important;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  border-left: 0 !important;
}

.cta-link:hover {
  background-color: #E5C158; /* Lighter gold */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
  border-left: 0 !important;
  padding-left: 1.25rem !important;
}

/* Decorative element */
.menu-decoration {
  padding: 1.5rem;
  margin-top: 1rem;
}

.gold-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  opacity: 0.6;
  margin: 1rem 0;
}
</style>
