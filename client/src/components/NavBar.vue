<template>
  <el-header class="navbar-header shadow-md" :class="{ 'navbar-hidden': isNavbarHidden }">
    <div class="container mx-auto px-4">
      <div class="h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 text-xl font-bold text-primary group">
          <scissors-icon :size="32" class="text-accent transform group-hover:rotate-45 transition-transform duration-300" />
          <span class="group-hover:text-accent transition-colors text-xl md:text-2xl font-black">Tailorly</span>
        </router-link>

        <!-- Navigation Links - Only visible on medium and larger screens -->
        <div class="hidden md:flex items-center gap-8">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="relative text-text-muted hover:text-primary transition-colors py-2 group"
          >
            {{ item.label }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
          </router-link>
          
          <div class="flex items-center gap-3">
            <!-- Show these buttons only when user is not authenticated -->
            <template v-if="!isAuthenticated">
              <el-button 
                @click="$router.push('/login')"
                class="!bg-[#1A237E] !border-[#1A237E] hover:!bg-[#283593] hover:!border-[#283593] !text-white shadow-md transition-colors"
              >
                Sign In
              </el-button>
              <el-button 
                @click="$router.push('/register')"
                class="!bg-[#1A237E] !border-[#1A237E] hover:!bg-[#283593] hover:!border-[#283593] !text-white shadow-md transition-colors"
              >
                Get Started
              </el-button>
            </template>
            
            <!-- Show admin panel button only for admin users -->
            <el-button 
              v-if="isAdmin && isAuthenticated"
              @click="$router.push('/admin')"
              class="!bg-[#1A237E] !border-[#1A237E] hover:!bg-[#283593] hover:!border-[#283593] !text-white shadow-md transition-colors"
            >
              Admin Panel
            </el-button>
            
            <!-- User profile dropdown for authenticated users -->
            <el-dropdown v-if="isAuthenticated" trigger="click">
              <div class="user-avatar-container cursor-pointer flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" 
                     :style="{ backgroundColor: userAvatarColor }">
                  {{ userInitials }}
                </div>
                <div class="hidden md:block text-left">
                  <div class="font-medium text-primary">{{ userName }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[120px]" v-if="currentUser && currentUser.email">{{ currentUser.email }}</div>
                </div>
                <el-icon class="text-gray-500"><arrow-down /></el-icon>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown-menu">
                  <div class="px-4 py-3 border-b border-gray-100 md:hidden">
                    <div class="font-medium">{{ userName }}</div>
                    <div class="text-sm text-gray-500 truncate" v-if="currentUser && currentUser.email">{{ currentUser.email }}</div>
                  </div>
                  <el-dropdown-item @click="$router.push('/profile')">
                    <user-icon :size="18" class="mr-2" />
                    <span>My Profile</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/orders')">
                    <list-icon :size="18" class="mr-2" />
                    <span>My Orders</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/measurements')">
                    <ruler-icon :size="18" class="mr-2" />
                    <span>My Measurements</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout" class="text-red-500 hover:text-red-600">
                    <log-out-icon :size="18" class="mr-2" />
                    <span>Logout</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import authService from '../services/auth.service'
import { 
  ScissorsIcon, 
  MenuIcon, 
  HomeIcon,
  RulerIcon,
  UsersIcon,
  InfoIcon,
  UserIcon,
  PlusCircleIcon,
  SettingsIcon,
  ListIcon,
  ArrowDownIcon,
  LogOutIcon
} from 'lucide-vue-next'

const router = useRouter()
const isNavbarHidden = ref(false)
const lastScrollTop = ref(0)
const scrollThreshold = 30 // Reduced threshold for more responsive behavior

// Authentication state
const isAuthenticated = ref(false)
const currentUser = ref(null)
const isAdmin = computed(() => {
  // Check for admin status in various ways the backend might structure it
  if (!currentUser.value) return false
  
  // Check common patterns for admin flag
  return (
    currentUser.value.role === 'admin' || 
    currentUser.value.isAdmin === true ||
    currentUser.value.admin === true ||
    currentUser.value.email === 'vocalunion8@gmail.com' // Specific admin email
  )
})

// User display information
const userName = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.name || currentUser.value.email.split('@')[0]
})

const userInitials = computed(() => {
  if (!currentUser.value) return ''
  if (currentUser.value.name) {
    const names = currentUser.value.name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return names[0][0].toUpperCase()
  }
  return currentUser.value.email[0].toUpperCase()
})

// Generate a consistent color based on user email
const userAvatarColor = computed(() => {
  if (!currentUser.value || !currentUser.value.email) return '#3E5879' // Default primary color
  
  // Simple hash function to generate a color
  const hash = Array.from(currentUser.value.email)
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  
  // Use a predefined set of colors for better aesthetics
  const colors = [
    '#3E5879', // Primary
    '#4A6DA7',
    '#5B7FC7',
    '#6B8FD7',
    '#7B9FE7',
    '#8BAFF7',
    '#9BBFF7',
    '#ABCFF7',
    '#BBDFF7',
    '#CBEFF7'
  ]
  
  return colors[Math.abs(hash) % colors.length]
})

// Handle user logout
async function handleLogout() {
  try {
    await authService.logout()
    isAuthenticated.value = false
    currentUser.value = null
    
    // Redirect to home page
    router.push('/')
    
    // Show success message
    ElMessage({
      message: 'You have been successfully logged out',
      type: 'success',
      duration: 3000
    })
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage({
      message: 'There was an error logging out. Please try again.',
      type: 'error',
      duration: 5000
    })
  }
}

// Check authentication status on component mount
async function checkAuth() {
  try {
    const authState = await authService.getAuthState()
    isAuthenticated.value = authState.isAuthenticated
    currentUser.value = authState.user
  } catch (error) {
    console.error('Auth check error:', error)
    isAuthenticated.value = false
    currentUser.value = null
  }
}

// Handle scroll events to hide/show navbar
function handleScroll() {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  // Only hide navbar when scrolling down and past threshold
  if (currentScrollTop > lastScrollTop.value && currentScrollTop > scrollThreshold) {
    isNavbarHidden.value = true
  } else {
    isNavbarHidden.value = false
  }
  
  lastScrollTop.value = currentScrollTop <= 0 ? 0 : currentScrollTop
}

// Add and remove scroll event listeners
onMounted(() => {
  // Check authentication status
  checkAuth()
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
.navbar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background-color: var(--color-card);
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: transform 0.3s ease;
  height: 64px;
  display: flex;
  align-items: center;
}

/* Hide navbar when scrolling down */
.navbar-hidden {
  transform: translateY(-100%);
}

.user-avatar-container {
  min-width: 40px;
}

:deep(.text-primary) {
  color: var(--color-primary);
}

:deep(.text-text-muted) {
  color: var(--color-text-muted);
}

:deep(.hover\:text-primary:hover) {
  color: var(--color-primary);
}

:deep(.bg-primary) {
  background-color: var(--color-primary);
}

:deep(.hover\:bg-primary-light:hover) {
  background-color: var(--color-primary-light);
}

:deep(.bg-success) {
  background-color: var(--color-success);
}

:deep(.hover\:bg-success-light:hover) {
  background-color: var(--color-success);
  opacity: 0.9;
}

:deep(.hover\:bg-gray-100:hover) {
  background-color: var(--color-hover);
}

@media (max-width: 768px) {
  .navbar-header {
    box-shadow: 0 2px 10px var(--color-shadow);
    padding: 0 12px !important;
    height: 70px !important;
  }
  
  :deep(body) {
    padding-top: 70px;
  }
}
</style>
