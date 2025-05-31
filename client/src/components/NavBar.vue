<template>
  <el-header class="navbar-header shadow-sm" :class="{ 'navbar-hidden': isNavbarHidden }">
    <div class="container mx-auto px-4">
      <div class="h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 text-xl font-bold group">
          <scissors-icon :size="32" class="text-[#D4AF37] transform group-hover:rotate-45 transition-transform duration-300" />
          <span class="text-[#D4AF37] group-hover:text-[#E5C158] transition-colors text-xl md:text-2xl font-black">Tailorly</span>
        </router-link>

        <!-- Navigation Links - Only visible on medium and larger screens -->
        <div class="hidden md:flex items-center gap-8">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="relative text-[#333333] hover:text-[#D4AF37] transition-colors py-2 group"
          >
            {{ item.label }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
          </router-link>
          
          <div class="flex items-center gap-3">
            <!-- Show these buttons only when user is not authenticated -->
            <template v-if="!isAuthenticated">
              <el-button 
                @click="$router.push('/login')"
                class="!bg-[#D4AF37] !border-[#D4AF37] hover:!bg-[#E5C158] hover:!border-[#E5C158] !text-[#1C1B1F] shadow-md transition-colors"
              >
                Sign In
              </el-button>
              <el-button 
                @click="$router.push('/register')"
                class="!bg-transparent !border-[#D4AF37] !text-[#D4AF37] hover:!bg-[#D4AF37] hover:!text-[#1C1B1F] shadow-md transition-colors"
              >
                Get Started
              </el-button>
            </template>
            
            <!-- Show admin panel button only for admin users -->
            <el-button 
              v-if="isAdmin && isAuthenticated"
              @click="$router.push('/admin')"
              class="!bg-[#D4AF37] !border-[#D4AF37] hover:!bg-[#E5C158] hover:!border-[#E5C158] !text-[#1C1B1F] shadow-md transition-colors"
            >
              Admin Panel
            </el-button>
            
            <!-- User profile dropdown for authenticated users -->
            <el-dropdown v-if="isAuthenticated" trigger="click">
              <div class="user-avatar-container cursor-pointer flex items-center gap-2 hover:bg-[#F5F5F5] p-2 rounded-lg transition-colors">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" 
                     :style="{ backgroundColor: userAvatarColor || '#D4AF37' }">
                  {{ userInitials }}
                </div>
                <span class="text-[#333333] hidden md:inline-block">{{ userName }}</span>
                <chevron-down-icon :size="16" class="text-[#777777]" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/profile')">
                    <user-icon :size="16" class="mr-2 text-[#D4AF37]" />
                    Profile
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/measurements')">
                    <ruler-icon :size="16" class="mr-2 text-[#D4AF37]" />
                    My Measurements
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/orders')">
                    <shopping-bag-icon :size="16" class="mr-2 text-[#D4AF37]" />
                    My Orders
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <log-out-icon :size="16" class="mr-2 text-[#D4AF37]" />
                    Logout
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
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  height: 64px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #EEEEEE;
}

/* Hide navbar when scrolling down */
.navbar-hidden {
  transform: translateY(-100%);
}

.user-avatar-container {
  min-width: 40px;
  border: 1px solid #3D3A42;
  border-radius: 8px;
}

/* Dropdown menu styling */
:deep(.el-dropdown-menu) {
  background-color: #FFFFFF !important;
  border: 1px solid #EEEEEE !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

:deep(.el-dropdown-menu__item) {
  color: #333333 !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #F5F5F5 !important;
  color: #D4AF37 !important;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: #999999 !important;
}

:deep(.el-dropdown__popper) {
  --el-dropdown-menuItem-hover-fill: #F5F5F5 !important;
  --el-dropdown-menuItem-hover-color: #D4AF37 !important;
}

/* Button styling */
:deep(.el-button) {
  border-radius: 8px !important;
  font-weight: 500 !important;
}

:deep(.el-button--primary) {
  background-color: #D4AF37 !important;
  border-color: #D4AF37 !important;
  color: #1C1B1F !important;
}

:deep(.el-button--primary:hover) {
  background-color: #E5C158 !important;
  border-color: #E5C158 !important;
}

@media (max-width: 768px) {
  .navbar-header {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    padding: 0 12px !important;
    height: 70px !important;
  }
  
  :deep(body) {
    padding-top: 70px;
  }
}
</style>
