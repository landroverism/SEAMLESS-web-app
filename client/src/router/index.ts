import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/measurements',
      name: 'measurements',
      component: () => import('../views/Measurements.vue')
    },
    {
      path: '/tailors',
      name: 'tailors',
      component: () => import('../views/Tailors.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/analytics',
      name: 'customer-analytics',
      component: () => import('../views/CustomerAnalytics.vue')
    },
    
    // Admin Setup route
    {
      path: '/admin-setup',
      name: 'admin-setup',
      component: () => import('../views/AdminSetup.vue')
    },
    
    // Admin routes
    {
      path: '/admin',
      component: () => import('../views/admin/AdminView.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'clients',
          name: 'admin-clients',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Clients.vue')
        },
        {
          path: 'orders',
          name: 'admin-orders',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Orders.vue')
        },
        {
          path: 'inventory',
          name: 'admin-inventory',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Inventory.vue')
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Analytics.vue')
        },
        {
          path: 'settings',
          name: 'admin-settings',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Settings.vue')
        },
        {
          path: 'appointments',
          name: 'admin-appointments',
          meta: { requiresAuth: true },
          component: () => import('../views/admin/Appointments.vue')
        }
      ]
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  // This is a simple implementation. In a real app, you would check if the user is authenticated
  // and has the proper role (admin/tailor) to access these routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // For demo purposes, we'll just allow access without authentication
    next()
    // In a real app, you would check authentication:
    // const isAuthenticated = checkIfUserIsAuthenticated()
    // if (isAuthenticated) {
    //   next()
    // } else {
    //   next('/login')
    // }
  } else {
    next()
  }
})

export default router