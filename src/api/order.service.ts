import { httpClient } from './http.client'
import type { Order, OrderFilters, OrderStats, OrderSorting, PaginatedResponse } from '@/types'
import { OrderStatus } from '@/enums/order-status.enum'

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    items: [
      { id: '1', productId: 'p1', productName: 'MacBook Pro 14"', quantity: 1, unitPrice: 1999, totalPrice: 1999 },
      { id: '2', productId: 'p2', productName: 'Magic Mouse', quantity: 2, unitPrice: 99, totalPrice: 198 }
    ],
    status: OrderStatus.Delivered,
    subtotal: 2197,
    tax: 219.70,
    total: 2416.70,
    shippingAddress: { street: '123 Main St', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA' },
    billingAddress: { street: '123 Main St', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA' },
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerId: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    items: [
      { id: '3', productId: 'p3', productName: 'iPhone 15 Pro', quantity: 1, unitPrice: 1199, totalPrice: 1199 }
    ],
    status: OrderStatus.Shipped,
    subtotal: 1199,
    tax: 119.90,
    total: 1318.90,
    shippingAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' },
    billingAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' },
    paymentMethod: 'PayPal',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-17T11:30:00Z'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerId: '3',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    items: [
      { id: '4', productId: 'p4', productName: 'iPad Air', quantity: 2, unitPrice: 599, totalPrice: 1198 },
      { id: '5', productId: 'p5', productName: 'Apple Pencil', quantity: 2, unitPrice: 129, totalPrice: 258 }
    ],
    status: OrderStatus.Approved,
    subtotal: 1456,
    tax: 145.60,
    total: 1601.60,
    shippingAddress: { street: '789 Pine Rd', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'USA' },
    billingAddress: { street: '789 Pine Rd', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'USA' },
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-17T14:45:00Z',
    updatedAt: '2024-01-17T14:45:00Z'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerId: '4',
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    items: [
      { id: '6', productId: 'p6', productName: 'AirPods Pro', quantity: 1, unitPrice: 249, totalPrice: 249 }
    ],
    status: OrderStatus.Pending,
    subtotal: 249,
    tax: 24.90,
    total: 273.90,
    shippingAddress: { street: '321 Elm St', city: 'Austin', state: 'TX', postalCode: '73301', country: 'USA' },
    billingAddress: { street: '321 Elm St', city: 'Austin', state: 'TX', postalCode: '73301', country: 'USA' },
    paymentMethod: 'Apple Pay',
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerId: '5',
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie.wilson@example.com',
    items: [
      { id: '7', productId: 'p7', productName: 'MacBook Air M3', quantity: 1, unitPrice: 1299, totalPrice: 1299 },
      { id: '8', productId: 'p8', productName: 'USB-C Hub', quantity: 1, unitPrice: 79, totalPrice: 79 }
    ],
    status: OrderStatus.Cancelled,
    subtotal: 1378,
    tax: 137.80,
    total: 1515.80,
    shippingAddress: { street: '654 Maple Dr', city: 'Denver', state: 'CO', postalCode: '80201', country: 'USA' },
    billingAddress: { street: '654 Maple Dr', city: 'Denver', state: 'CO', postalCode: '80201', country: 'USA' },
    paymentMethod: 'Credit Card',
    notes: 'Customer requested cancellation',
    createdAt: '2024-01-14T16:20:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customerId: '6',
    customerName: 'Diana Martinez',
    customerEmail: 'diana.martinez@example.com',
    items: [
      { id: '9', productId: 'p9', productName: 'Apple Watch Ultra', quantity: 1, unitPrice: 799, totalPrice: 799 }
    ],
    status: OrderStatus.Pending,
    subtotal: 799,
    tax: 79.90,
    total: 878.90,
    shippingAddress: { street: '987 Cedar Ln', city: 'Miami', state: 'FL', postalCode: '33101', country: 'USA' },
    billingAddress: { street: '987 Cedar Ln', city: 'Miami', state: 'FL', postalCode: '33101', country: 'USA' },
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-19T10:15:00Z',
    updatedAt: '2024-01-19T10:15:00Z'
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    items: [
      { id: '10', productId: 'p10', productName: 'Studio Display', quantity: 1, unitPrice: 1599, totalPrice: 1599 }
    ],
    status: OrderStatus.Approved,
    subtotal: 1599,
    tax: 159.90,
    total: 1758.90,
    shippingAddress: { street: '123 Main St', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA' },
    billingAddress: { street: '123 Main St', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA' },
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  }
]

/**
 * Order Service - handles all order-related API operations
 */
class OrderService {
  private useMock = true // Toggle for API vs mock data

  /**
   * Get paginated list of orders with filtering and sorting
   */
  async getOrders(
    page = 1,
    pageSize = 10,
    filters?: OrderFilters,
    sorting?: OrderSorting
  ): Promise<PaginatedResponse<Order>> {
    if (this.useMock) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.getMockOrders(page, pageSize, filters, sorting)
    }
    
    return httpClient.get<PaginatedResponse<Order>>('/orders', {
      page,
      pageSize,
      status: filters?.status,
      search: filters?.search,
      sortBy: sorting?.field,
      sortDir: sorting?.direction
    })
  }

  /**
   * Get mock orders with filtering and sorting applied
   */
  private getMockOrders(
    page: number,
    pageSize: number,
    filters?: OrderFilters,
    sorting?: OrderSorting
  ): PaginatedResponse<Order> {
    let filteredOrders = [...mockOrders]

    // Apply status filter
    if (filters?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status)
    }

    // Apply search filter
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerEmail.toLowerCase().includes(search)
      )
    }

    // Apply date range filter
    if (filters?.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= fromDate)
    }

    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo)
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= toDate)
    }

    // Apply sorting
    if (sorting?.field) {
      filteredOrders.sort((a, b) => {
        const field = sorting.field as keyof Order
        let aValue = a[field]
        let bValue = b[field]

        // Handle date fields
        if (field === 'createdAt' || field === 'updatedAt') {
          aValue = new Date(aValue as string).getTime() as unknown as Order[keyof Order]
          bValue = new Date(bValue as string).getTime() as unknown as Order[keyof Order]
        }

        // Handle numeric fields
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sorting.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle string fields
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        
        if (sorting.direction === 'asc') {
          return aStr.localeCompare(bStr)
        }
        return bStr.localeCompare(aStr)
      })
    }

    const total = filteredOrders.length
    const start = (page - 1) * pageSize
    const data = filteredOrders.slice(start, start + pageSize)

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockOrders.find(o => o.id === id) || null
    }
    return httpClient.get<Order>(`/orders/${id}`)
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<OrderStats> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return {
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === OrderStatus.Pending).length,
        completedOrders: mockOrders.filter(o => o.status === OrderStatus.Delivered).length,
        totalRevenue: mockOrders
          .filter(o => o.status !== OrderStatus.Cancelled)
          .reduce((sum, o) => sum + o.total, 0),
        averageOrderValue: mockOrders.reduce((sum, o) => sum + o.total, 0) / mockOrders.length
      }
    }
    return httpClient.get<OrderStats>('/orders/stats')
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = mockOrders.find(o => o.id === id)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
        return { ...order }
      }
      throw { message: 'Order not found', code: 'NOT_FOUND', statusCode: 404 }
    }
    return httpClient.patch<Order>(`/orders/${id}/status`, { status })
  }

  /**
   * Create a new order
   */
  async createOrder(order: Partial<Order>): Promise<Order> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400))
      const newOrder: Order = {
        id: String(mockOrders.length + 1),
        orderNumber: `ORD-2024-${String(mockOrders.length + 1).padStart(3, '0')}`,
        status: OrderStatus.Pending,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...order
      } as Order
      mockOrders.unshift(newOrder)
      return newOrder
    }
    return httpClient.post<Order>('/orders', order)
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockOrders.findIndex(o => o.id === id)
      if (index > -1) {
        mockOrders.splice(index, 1)
      }
      return
    }
    return httpClient.delete(`/orders/${id}`)
  }
}

export const orderService = new OrderService()
