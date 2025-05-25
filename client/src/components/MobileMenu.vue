<template>
  <div class="mobile-navigation">
    <!-- Stylish mobile menu button -->
    <button 
      class="mobile-menu-button"
      @click="toggleMenu"
      aria-label="Toggle menu"
    >
      <span class="sr-only">Menu</span>
      <div class="hamburger-icon" :class="{ 'is-active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
    
    <!-- Mobile slide-in menu -->
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
        <div class="p-4 border-b">
          <h2 class="text-xl font-bold">Tailorly</h2>
        </div>
        
        <nav class="py-4">
          <ul>
            <li v-for="item in menuItems" :key="item.path" class="mobile-menu-item">
              <router-link 
                :to="item.path" 
                class="block py-3 px-4 hover:bg-gray-100 transition-colors"
                @click="closeMenu"
              >
                <span class="menu-icon mr-3">
                  <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                </span>
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user'; // Assuming you have a user store

const router = useRouter();
const userStore = useUserStore();

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.classList.remove('overflow-hidden');
};

// Determine menu items based on user role
const isAdmin = computed(() => {
  const user = userStore.user;
  return user && user.isAdmin;
});

const menuItems = computed(() => {
  // Common menu items for all users
  const items = [
    { name: 'Home', path: '/', icon: 'House' },
    { name: 'Measurements', path: '/measurements', icon: 'Ruler' },
    { name: 'Tailors', path: '/tailors', icon: 'User' },
  ];

  // Add auth-related items
  if (userStore.user) {
    // User is logged in
    if (isAdmin.value) {
      // Admin-specific menu items
      items.push(
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'DataAnalysis' },
        { name: 'Orders', path: '/admin/orders', icon: 'List' },
        { name: 'Clients', path: '/admin/clients', icon: 'UserFilled' },
        { name: 'Settings', path: '/admin/settings', icon: 'Setting' }
      );
    } else {
      // Regular user menu items
      items.push(
        { name: 'My Profile', path: '/profile', icon: 'User' },
        { name: 'My Orders', path: '/orders', icon: 'List' }
      );
    }
    
    // Add logout option
    items.push({ 
      name: 'Logout', 
      path: '/logout', 
      icon: 'SwitchButton',
      action: () => {
        userStore.logout();
        router.push('/login');
        closeMenu();
      }
    });
  } else {
    // User is not logged in
    items.push(
      { name: 'Login', path: '/login', icon: 'Key' },
      { name: 'Register', path: '/register', icon: 'Plus' }
    );
  }
  
  return items;
});
</script>

<style scoped>
/* Mobile menu styles are imported from mobile-responsive.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
