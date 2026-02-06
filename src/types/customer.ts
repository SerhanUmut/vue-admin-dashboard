export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  company?: string
  address: CustomerAddress
  status: CustomerStatus
  totalOrders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
  lastOrderAt?: string
}

export interface CustomerAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CustomerStatus = 'active' | 'inactive' | 'blocked'

export interface CustomerFilters {
  status?: CustomerStatus | null
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  averageOrdersPerCustomer: number
}
