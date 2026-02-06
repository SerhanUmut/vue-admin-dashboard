import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { customerService } from '@/api'
import type { Customer, CustomerFilters, CustomerStats } from '@/types'

export const useCustomerStore = defineStore('customer', () => {
  // State
  const customers = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const stats = ref<CustomerStats | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const filters = ref<CustomerFilters>({
    status: null,
    search: ''
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeCustomers = computed(() => 
    customers.value.filter(c => c.status === 'active')
  )
  const topCustomers = computed(() => 
    [...customers.value]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
  )
  const hasFilters = computed(() => 
    !!filters.value.status || !!filters.value.search
  )

  // Actions
  async function fetchCustomers(page?: number): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await customerService.getCustomers(
        page || pagination.value.page,
        pagination.value.pageSize,
        filters.value
      )
      
      customers.value = response.data
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to fetch customers'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCustomerById(id: string): Promise<Customer | null> {
    isLoading.value = true
    error.value = null
    
    try {
      const customer = await customerService.getCustomerById(id)
      currentCustomer.value = customer
      return customer
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to fetch customer'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStats(): Promise<void> {
    try {
      stats.value = await customerService.getCustomerStats()
    } catch (err) {
      console.error('Failed to fetch customer stats:', err)
    }
  }

  async function createCustomer(data: Partial<Customer>): Promise<Customer | null> {
    isLoading.value = true
    error.value = null
    
    try {
      const newCustomer = await customerService.createCustomer(data)
      customers.value.unshift(newCustomer)
      pagination.value.total += 1
      await fetchStats()
      return newCustomer
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to create customer'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateCustomer(id: string, data: Partial<Customer>): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedCustomer = await customerService.updateCustomer(id, data)
      
      const index = customers.value.findIndex(c => c.id === id)
      if (index > -1) {
        customers.value[index] = updatedCustomer
      }
      
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = updatedCustomer
      }
      
      return true
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to update customer'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCustomer(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      await customerService.deleteCustomer(id)
      customers.value = customers.value.filter(c => c.id !== id)
      
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
      
      pagination.value.total -= 1
      await fetchStats()
      
      return true
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to delete customer'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<CustomerFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters(): void {
    filters.value = { status: null, search: '' }
  }

  function setPage(page: number): void {
    pagination.value.page = page
  }

  function setPageSize(pageSize: number): void {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  function clearError(): void {
    error.value = null
  }

  function clearCurrentCustomer(): void {
    currentCustomer.value = null
  }

  return {
    // State
    customers,
    currentCustomer,
    stats,
    pagination,
    filters,
    isLoading,
    error,
    // Getters
    activeCustomers,
    topCustomers,
    hasFilters,
    // Actions
    fetchCustomers,
    fetchCustomerById,
    fetchStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    clearError,
    clearCurrentCustomer
  }
})
