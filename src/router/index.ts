import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

// Lazy-loaded route components
const Login = () => import('@/modules/auth/Login.vue')
const Dashboard = () => import('@/modules/dashboard/Dashboard.vue')
const Orders = () => import('@/modules/orders/Orders.vue')
const Customers = () => import('@/modules/customers/Customers.vue')
const Settings = () => import('@/modules/settings/Settings.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Login'
    }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: Orders,
        meta: {
          title: 'Orders',
          permission: 'orders.read'
        }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: Customers,
        meta: {
          title: 'Customers',
          permission: 'customers.read'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: 'Settings'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Check authentication status on first load
  if (!authStore.user && authStore.isLoading === false) {
    await authStore.checkAuth()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthenticated = authStore.isAuthenticated

  // Update document title
  const appName = 'Admin Dashboard'
  document.title = to.meta.title ? `${to.meta.title} | ${appName}` : appName

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to dashboard if user is already authenticated and trying to access login
    next('/dashboard')
  } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
    // Check for required permissions
    next('/dashboard')
  } else {
    next()
  }
})

export default router
