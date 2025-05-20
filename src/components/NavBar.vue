<template>
  <el-header class="bg-surface border-b border-[#BDC3C7] shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-primary group">
          <scissors-icon :size="24" class="text-accent transform group-hover:rotate-45 transition-transform duration-300" />
          <span class="group-hover:text-accent transition-colors">Tailorly</span>
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
          </div>
        </div>

        <el-button 
          class="lg:hidden"
          @click="drawer = true"
          text
        >
          <menu-icon class="text-primary hover:text-accent transition-colors" :size="24" />
        </el-button>
      </div>
    </div>

    <el-drawer
      v-model="drawer"
      direction="rtl"
      size="80%"
      class="mobile-menu"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <scissors-icon :size="24" class="text-accent" />
          <span class="text-xl font-bold text-primary">Tailorly</span>
        </div>
      </template>

      <div class="flex flex-col gap-6 p-4">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="text-text-muted hover:text-primary py-2 transition-colors flex items-center gap-2"
          @click="drawer = false"
        >
          <component :is="item.icon" :size="20" />
          {{ item.label }}
        </router-link>
        
        <div class="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-200">
          <el-button 
            plain
            @click="$router.push('/login')"
            class="w-full justify-center"
          >
            Sign In
          </el-button>
          <el-button 
            type="primary" 
            @click="$router.push('/register')"
            class="w-full justify-center"
          >
            Get Started
          </el-button>
        </div>
      </div>
    </el-drawer>
  </el-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  ScissorsIcon, 
  MenuIcon, 
  HomeIcon,
  RulerIcon,
  UsersIcon,
  InfoIcon
} from 'lucide-vue-next'

const drawer = ref(false)

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
.mobile-menu :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);
}

.mobile-menu :deep(.el-drawer__body) {
  padding: 0;
}
</style>