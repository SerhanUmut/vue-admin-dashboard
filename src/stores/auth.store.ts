import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api'
import type { User, LoginCredentials } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userFullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )
  const userRole = computed(() => user.value?.role || null)
  const hasPermission = computed(() => (permission: string) => 
    user.value?.permissions.includes(permission) || user.value?.role === 'admin'
  )

  // Actions
  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      user.value = response.user
      return true
    } catch (err) {
      error.value = (err as { message: string }).message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    
    try {
      await authService.logout()
    } finally {
      user.value = null
      isLoading.value = false
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (!authService.isAuthenticated()) {
      user.value = null
      return false
    }

    isLoading.value = true
    
    try {
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      return !!currentUser
    } catch {
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshSession(): Promise<boolean> {
    try {
      const response = await authService.refreshToken()
      user.value = response.user
      return true
    } catch {
      user.value = null
      return false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userFullName,
    userRole,
    hasPermission,
    // Actions
    login,
    logout,
    checkAuth,
    refreshSession,
    clearError
  }
})
