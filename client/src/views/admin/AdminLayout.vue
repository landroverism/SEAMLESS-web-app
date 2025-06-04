<template>
  <div class="admin-layout">
    <el-container class="h-screen">
      <!-- Sidebar Navigation -->
      <el-aside width="250px" class="bg-primary text-white h-screen">
        <div class="p-4 border-b border-white/10 flex items-center gap-2">
          <scissors-icon :size="24" class="text-highlight" />
          <h1 class="text-xl font-bold">Tailorly Admin</h1>
        </div>
        
        <el-menu
          class="admin-menu bg-primary text-white border-none"
          :default-active="activeMenu"
          router
        >
          <el-menu-item index="/admin/dashboard" route="/admin/dashboard">
            <template #title>
              <layout-dashboard-icon :size="18" class="mr-2" />
              <span>Dashboard</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/admin/orders" route="/admin/orders">
            <template #title>
              <shopping-bag-icon :size="18" class="mr-2" />
              <span>Orders</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/admin/clients" route="/admin/clients">
            <template #title>
              <users-icon :size="18" class="mr-2" />
              <span>Clients</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/admin/inventory" route="/admin/inventory">
            <template #title>
              <package-icon :size="18" class="mr-2" />
              <span>Inventory</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/admin/analytics" route="/admin/analytics">
            <template #title>
              <bar-chart-icon :size="18" class="mr-2" />
              <span>Analytics</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/admin/settings" route="/admin/settings">
            <template #title>
              <settings-icon :size="18" class="mr-2" />
              <span>Settings</span>
            </template>
          </el-menu-item>
        </el-menu>
        
        <div class="mt-auto p-4 border-t border-white/10">
          <el-button type="danger" plain class="w-full" @click="logout">
            <log-out-icon :size="18" class="mr-2" />
            Logout
          </el-button>
        </div>
      </el-aside>
      
      <!-- Main Content Area -->
      <el-container>
        <!-- Header -->
        <el-header class="admin-header flex items-center justify-between">
          <div class="flex items-center">
            <h2 class="text-xl font-bold text-primary">{{ pageTitle }}</h2>
          </div>
          
          <div class="flex items-center gap-4">
            <el-badge :value="3" class="notification-badge">
              <bell-icon :size="20" class="cursor-pointer text-gray-600" />
            </el-badge>
            
            <el-dropdown trigger="click">
              <div class="flex items-center gap-2 cursor-pointer">
                <el-avatar :size="32" src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80" />
                <span class="text-gray-800">Kelly Kevin</span>
                <chevron-down-icon :size="16" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Profile</el-dropdown-item>
                  <el-dropdown-item>Settings</el-dropdown-item>
                  <el-dropdown-item divided>Logout</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- Main Content -->
        <el-main class="admin-content bg-papaya-whip">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ScissorsIcon, 
  LayoutDashboardIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  PackageIcon, 
  BarChartIcon, 
  SettingsIcon, 
  LogOutIcon,
  BellIcon,
  ChevronDownIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Get the active menu item based on the current route
const activeMenu = computed(() => route.path)

// Set page title based on the current route
const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/orders')) return 'Orders'
  if (path.includes('/clients')) return 'Clients'
  if (path.includes('/inventory')) return 'Inventory'
  if (path.includes('/analytics')) return 'Analytics'
  if (path.includes('/settings')) return 'Settings'
  return 'Admin Panel'
})

// Logout function
const logout = () => {
  // In a real app, you would implement proper logout logic here
  router.push('/login')
}
</script>

<style scoped>
.admin-menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgba(255, 255, 255, 0.7);
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.1);
  --el-menu-active-color: white;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-badge :deep(.el-badge__content) {
  top: 0;
  right: 0;
}
</style>
