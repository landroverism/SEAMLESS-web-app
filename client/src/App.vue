<template>
  <el-config-provider>
    <div class="min-h-screen flex flex-col bg-secondary">
      <nav-bar class="desktop-nav" />
      <mobile-menu class="md:hidden" />
      <main class="flex-grow">
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
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import MobileMenu from './components/MobileMenu.vue'
import MobileFeedback from './components/MobileFeedback.vue'
import './assets/css/mobile-responsive.css'

// Theme is now applied via CSS variables in index.css
// This provides better compatibility with the ElConfigProvider
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