import type { OrderStatus } from '@/enums/order-status.enum'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface OrderFilters {
  status?: OrderStatus | null
  search?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
}

export interface OrderSorting {
  field: keyof Order | null
  direction: 'asc' | 'desc'
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrderQueryParams {
  page?: number
  pageSize?: number
  filters?: OrderFilters
  sorting?: OrderSorting
}
