<template>
  <el-config-provider :theme="themeOverrides">
    <div class="min-h-screen flex flex-col bg-secondary">
      <nav-bar />
      <main class="flex-grow">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <app-footer />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'

const themeOverrides = ref({
  colors: {
    'primary': '#2C3E50',
    'success': '#27AE60',
    'warning': '#F1C40F',
    'danger': '#E74C3C',
    'info': '#7F8C8D',
  }
})
</script>

<style>
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