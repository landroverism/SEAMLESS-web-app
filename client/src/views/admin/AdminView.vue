<template>
  <admin-layout :default-section="currentSection">
    <!-- Dashboard Section -->
    <template #dashboard>
      <div v-if="currentSection === 'dashboard'">
        <router-view />
      </div>
      <div v-else class="p-4">
        <h2 class="text-xl font-bold mb-4">Dashboard</h2>
        <p class="text-gray-500">Loading dashboard content...</p>
      </div>
    </template>
    
    <!-- Orders Section -->
    <template #orders>
      <div v-if="currentSection === 'orders'">
        <router-view />
      </div>
      <div v-else class="p-4">
        <h2 class="text-xl font-bold mb-4">Orders</h2>
        <p class="text-gray-500">Loading orders content...</p>
      </div>
    </template>
    
    <!-- Clients Section -->
    <template #clients>
      <div v-if="currentSection === 'clients'">
        <router-view />
      </div>
      <div v-else class="p-4">
        <h2 class="text-xl font-bold mb-4">Clients</h2>
        <p class="text-gray-500">Loading clients content...</p>
      </div>
    </template>
    
    <!-- Inventory Section -->
    <template #inventory>
      <div v-if="currentSection === 'inventory'">
        <router-view />
      </div>
      <div v-else class="p-4">
        <h2 class="text-xl font-bold mb-4">Inventory</h2>
        <p class="text-gray-500">Loading inventory content...</p>
      </div>
    </template>
    
    <!-- Settings Section -->
    <template #settings>
      <div v-if="currentSection === 'settings'">
        <router-view />
      </div>
      <div v-else class="p-4">
        <h2 class="text-xl font-bold mb-4">Settings</h2>
        <p class="text-gray-500">Loading settings content...</p>
      </div>
    </template>
  </admin-layout>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '../../components/AdminLayout.vue';

const route = useRoute();

// Get current route path
const currentRoute = computed(() => route.path);

// Determine current section based on route
const currentSection = computed(() => {
  const path = route.path;
  if (path.includes('/admin/dashboard')) return 'dashboard';
  if (path.includes('/admin/orders')) return 'orders';
  if (path.includes('/admin/clients')) return 'clients';
  if (path.includes('/admin/inventory')) return 'inventory';
  if (path.includes('/admin/settings')) return 'settings';
  return 'dashboard'; // Default
});
</script>

<style scoped>
/* Component-specific styles */
</style>
