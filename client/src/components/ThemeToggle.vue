<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle"
    :class="{ 'dark-mode': isDarkMode }"
    :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    aria-label="Toggle dark/light mode"
  >
    <div class="toggle-icon-container">
      <sun-icon v-if="isDarkMode" :size="18" class="theme-icon" />
      <moon-icon v-else :size="18" class="theme-icon" />
    </div>
  </button>
</template>

<script setup>
import { SunIcon, MoonIcon } from 'lucide-vue-next';
import themeService from '../services/theme.service';
import { computed } from 'vue';

const isDarkMode = computed(() => themeService.isDarkMode.value);

const toggleTheme = () => {
  themeService.toggleTheme();
};
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3E5879;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #F5EFE7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin: 0;
  z-index: 1000;
  padding: 0;
  overflow: hidden;
}

.theme-toggle:hover {
  background-color: #4E6A8F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.toggle-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-right: 8px;
}

.theme-label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.theme-icon {
  color: #F5EFE7;
}

.theme-toggle.dark-mode {
  background-color: #D8C4B6;
  background-image: linear-gradient(135deg, #D8C4B6, #3E5879);
}

.theme-toggle.dark-mode:hover {
  background-color: #F5EFE7;
  background-image: linear-gradient(135deg, #F5EFE7, #D8C4B6);
}

/* Ensure visibility in both modes */
:deep(html.dark) .theme-toggle {
  background-color: #D8C4B6;
  background-image: linear-gradient(135deg, #D8C4B6, #3E5879);
}

:deep(html.dark) .theme-toggle:hover {
  background-color: #F5EFE7;
  background-image: linear-gradient(135deg, #F5EFE7, #D8C4B6);
}

/* Light mode styling */
.theme-toggle:not(.dark-mode) {
  background-image: linear-gradient(135deg, #3E5879, #4E6A8F);
}

.theme-toggle:not(.dark-mode):hover {
  background-image: linear-gradient(135deg, #4E6A8F, #3E5879);
}
</style>
