import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderService } from '@/api'
import type { Order, OrderFilters, OrderStats, OrderSorting } from '@/types'
import { OrderStatus } from '@/enums/order-status.enum'

export const useOrderStore = defineStore('order', () => {
  // ============================================
  // State
  // ============================================
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const stats = ref<OrderStats | null>(null)
  
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  
  const filters = ref<OrderFilters>({
    status: null,
    search: ''
  })
  
  const sorting = ref<OrderSorting>({
    field: null,
    direction: 'desc'
  })
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // Getters
  // ============================================
  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === OrderStatus.Pending)
  )
  
  const recentOrders = computed(() => 
    [...orders.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  )
  
  const hasFilters = computed(() => 
    !!filters.value.status || !!filters.value.search || !!filters.value.dateFrom || !!filters.value.dateTo
  )

  const totalRevenue = computed(() => 
    orders.value
      .filter(o => o.status !== OrderStatus.Cancelled)
      .reduce((sum, o) => sum + o.total, 0)
  )

  const ordersByStatus = computed(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      [OrderStatus.Pending]: [],
      [OrderStatus.Approved]: [],
      [OrderStatus.Shipped]: [],
      [OrderStatus.Cancelled]: [],
      [OrderStatus.Delivered]: []
    }
    orders.value.forEach(order => {
      grouped[order.status].push(order)
    })
    return grouped
  })

  // ============================================
  // Actions
  // ============================================
  
  /**
   * Fetch orders with current filters, sorting, and pagination
   */
  async function fetchOrders(page?: number): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await orderService.getOrders(
        page || pagination.value.page,
        pagination.value.pageSize,
        filters.value,
        sorting.value
      )
      
      orders.value = response.data
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single order by ID
   */
  async function fetchOrderById(id: string): Promise<Order | null> {
    isLoading.value = true
    error.value = null
    
    try {
      const order = await orderService.getOrderById(id)
      currentOrder.value = order
      return order
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to fetch order'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch order statistics
   */
  async function fetchStats(): Promise<void> {
    try {
      stats.value = await orderService.getOrderStats()
    } catch (err) {
      console.error('Failed to fetch order stats:', err)
    }
  }

  /**
   * Update order status
   */
  async function updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status)
      
      // Update in local state
      const index = orders.value.findIndex(o => o.id === id)
      if (index > -1) {
        orders.value[index] = updatedOrder
      }
      
      if (currentOrder.value?.id === id) {
        currentOrder.value = updatedOrder
      }
      
      // Refresh stats
      await fetchStats()
      
      return true
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to update order status'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an order
   */
  async function deleteOrder(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      await orderService.deleteOrder(id)
      orders.value = orders.value.filter(o => o.id !== id)
      
      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }
      
      pagination.value.total -= 1
      await fetchStats()
      
      return true
    } catch (err) {
      error.value = (err as { message: string }).message || 'Failed to delete order'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set sorting and refetch orders
   */
  function setSorting(field: keyof Order | null, direction?: 'asc' | 'desc'): void {
    // Toggle direction if same field
    if (field === sorting.value.field && !direction) {
      sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sorting.value.field = field
      sorting.value.direction = direction || 'asc'
    }
  }

  /**
   * Set filters
   */
  function setFilters(newFilters: Partial<OrderFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Clear all filters
   */
  function clearFilters(): void {
    filters.value = { status: null, search: '', dateFrom: undefined, dateTo: undefined }
  }

  /**
   * Set current page
   */
  function setPage(page: number): void {
    pagination.value.page = page
  }

  /**
   * Set page size
   */
  function setPageSize(pageSize: number): void {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  /**
   * Clear error
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Clear current order
   */
  function clearCurrentOrder(): void {
    currentOrder.value = null
  }

  /**
   * Reset store to initial state
   */
  function $reset(): void {
    orders.value = []
    currentOrder.value = null
    stats.value = null
    pagination.value = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
    filters.value = { status: null, search: '' }
    sorting.value = { field: null, direction: 'desc' }
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    orders,
    currentOrder,
    stats,
    pagination,
    filters,
    sorting,
    isLoading,
    error,
    // Getters
    pendingOrders,
    recentOrders,
    hasFilters,
    totalRevenue,
    ordersByStatus,
    // Actions
    fetchOrders,
    fetchOrderById,
    fetchStats,
    updateStatus,
    deleteOrder,
    setSorting,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    clearError,
    clearCurrentOrder,
    $reset
  }
})
