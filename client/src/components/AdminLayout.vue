<template>
  <div class="admin-layout">
    <!-- Mobile Header with Menu Toggle -->
    <div class="mobile-admin-header md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
      <h1 class="text-xl font-bold text-primary">Tailorly Admin</h1>
      <button 
        class="menu-toggle-btn"
        @click="toggleSidebar"
        aria-label="Toggle menu"
      >
        <div class="hamburger" :class="{ 'is-active': sidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
    
    <!-- Admin Sidebar -->
    <aside 
      class="admin-sidebar"
      :class="{ 'open': sidebarOpen }"
    >
      <div class="sidebar-header hidden md:flex items-center p-4 border-b">
        <div class="flex items-center">
          <span class="text-yellow-500 mr-2">✂️</span>
          <h1 class="text-xl font-bold">Tailorly Admin</h1>
        </div>
      </div>
      
      <div class="sidebar-content py-4">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.id">
            <a 
              href="#" 
              class="sidebar-link flex items-center p-3 mx-2 rounded-md transition-colors"
              :class="{ 'active': activeSection === item.id }"
              @click.prevent="showSection(item.id)"
            >
              <el-icon class="mr-3"><component :is="item.icon" /></el-icon>
              <span>{{ item.name }}</span>
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Logout Button -->
      <div class="sidebar-footer p-4 border-t mt-auto">
        <button 
          class="logout-btn flex items-center justify-center w-full p-3 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          @click="logout"
        >
          <el-icon class="mr-2"><SwitchButton /></el-icon>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    
    <!-- Admin Content -->
    <div class="admin-content">
      <!-- Content Sections -->
      <div 
        v-for="item in menuItems" 
        :key="item.id"
        class="admin-content-section"
        :class="{ 'hidden': activeSection !== item.id }"
        :id="'section-' + item.id"
      >
        <slot :name="item.id"></slot>
      </div>
    </div>
    
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="windowWidth <= 768" 
      class="sidebar-overlay"
      :class="{ 'active': sidebarOpen }"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { SwitchButton } from '@element-plus/icons-vue';

// Props
const props = defineProps({
  defaultSection: {
    type: String,
    default: 'dashboard'
  }
});

// Menu items
const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: 'DataAnalysis' },
  { id: 'orders', name: 'Orders', icon: 'List' },
  { id: 'clients', name: 'Clients', icon: 'User' },
  { id: 'inventory', name: 'Inventory', icon: 'Box' },
  { id: 'settings', name: 'Settings', icon: 'Setting' }
];

// Active section
const activeSection = ref(props.defaultSection);

// Sidebar state
const sidebarOpen = ref(false);

// Router and store
const router = useRouter();
const userStore = useUserStore();

// Window width for responsive behavior
const windowWidth = ref(window.innerWidth);

// Toggle sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
  
  // Prevent body scrolling when sidebar is open on mobile
  if (sidebarOpen.value && windowWidth.value <= 768) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
};

// Close sidebar
const closeSidebar = () => {
  sidebarOpen.value = false;
  document.body.classList.remove('overflow-hidden');
};

// Show section
const showSection = (sectionId) => {
  activeSection.value = sectionId;
  
  // Navigate to the corresponding route
  router.push(`/admin/${sectionId}`);
  
  // Close sidebar on mobile after selection
  if (windowWidth.value <= 768) {
    closeSidebar();
  }
};

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  
  // Auto-close sidebar on larger screens
  if (windowWidth.value > 768) {
    document.body.classList.remove('overflow-hidden');
  }
};

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// Logout function
const logout = async () => {
  try {
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.body.classList.remove('overflow-hidden');
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.admin-sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #eaeaea;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background-color: #f9fafb;
}

.sidebar-link {
  color: #4b5563;
}

.sidebar-link:hover {
  background-color: #f3f4f6;
}

.sidebar-link.active {
  background-color: #e5e7eb;
  color: #2C3E50;
  font-weight: 500;
}

/* Mobile styles */
@media (max-width: 768px) {
  .admin-layout {
    display: block;
  }
  
  .admin-sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 100;
    transition: left 0.3s ease;
    padding-top: 60px; /* Space for mobile header */
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
  
  .admin-sidebar.open {
    left: 0;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }
  
  .admin-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
    padding-top: 70px; /* Space for mobile header */
  }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .sidebar-overlay.active {
    visibility: visible;
    opacity: 1;
  }
  
  .mobile-admin-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 80;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  /* Hamburger button */
  .menu-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .hamburger {
    width: 24px;
    height: 20px;
    position: relative;
    transform: rotate(0deg);
    transition: .5s ease-in-out;
  }
  
  .hamburger span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: #2c3e50;
    border-radius: 3px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
  }
  
  .hamburger span:nth-child(1) {
    top: 0px;
  }
  
  .hamburger span:nth-child(2) {
    top: 8px;
  }
  
  .hamburger span:nth-child(3) {
    top: 16px;
  }
  
  .hamburger.is-active span:nth-child(1) {
    top: 8px;
    transform: rotate(135deg);
  }
  
  .hamburger.is-active span:nth-child(2) {
    opacity: 0;
    left: -60px;
  }
  
  .hamburger.is-active span:nth-child(3) {
    top: 8px;
    transform: rotate(-135deg);
  }
}
</style>
