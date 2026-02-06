import { httpClient } from './http.client'
import type { Customer, CustomerFilters, CustomerStats, PaginatedResponse } from '@/types'

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    company: 'Tech Corp',
    address: { street: '123 Main St', city: 'San Francisco', state: 'CA', postalCode: '94102', country: 'USA' },
    status: 'active',
    totalOrders: 12,
    totalSpent: 15420.50,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z',
    lastOrderAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    company: 'Design Studio',
    address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' },
    status: 'active',
    totalOrders: 8,
    totalSpent: 8750.00,
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2024-01-17T11:30:00Z',
    lastOrderAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    address: { street: '789 Pine Rd', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'USA' },
    status: 'active',
    totalOrders: 5,
    totalSpent: 4200.30,
    createdAt: '2023-09-10T14:45:00Z',
    updatedAt: '2024-01-17T14:45:00Z',
    lastOrderAt: '2024-01-17T14:45:00Z'
  },
  {
    id: '4',
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@example.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    company: 'StartupXYZ',
    address: { street: '321 Elm St', city: 'Austin', state: 'TX', postalCode: '73301', country: 'USA' },
    status: 'active',
    totalOrders: 3,
    totalSpent: 1890.00,
    createdAt: '2023-11-05T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z',
    lastOrderAt: '2024-01-18T08:00:00Z'
  },
  {
    id: '5',
    firstName: 'Charlie',
    lastName: 'Wilson',
    email: 'charlie.wilson@example.com',
    phone: '+1 (555) 567-8901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    address: { street: '654 Maple Dr', city: 'Denver', state: 'CO', postalCode: '80201', country: 'USA' },
    status: 'inactive',
    totalOrders: 2,
    totalSpent: 850.00,
    createdAt: '2023-07-20T16:20:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    lastOrderAt: '2024-01-14T16:20:00Z'
  },
  {
    id: '6',
    firstName: 'Diana',
    lastName: 'Martinez',
    email: 'diana.martinez@example.com',
    phone: '+1 (555) 678-9012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    company: 'Creative Agency',
    address: { street: '987 Cedar Ln', city: 'Miami', state: 'FL', postalCode: '33101', country: 'USA' },
    status: 'active',
    totalOrders: 15,
    totalSpent: 22340.75,
    createdAt: '2023-05-01T11:00:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
    lastOrderAt: '2024-01-19T10:15:00Z'
  }
]

class CustomerService {
  private useMock = true // Toggle for API vs mock data

  async getCustomers(
    page = 1,
    pageSize = 10,
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Customer>> {
    if (this.useMock) {
      return this.getMockCustomers(page, pageSize, filters)
    }
    
    return httpClient.get<PaginatedResponse<Customer>>('/customers', {
      page,
      pageSize,
      ...filters
    })
  }

  private getMockCustomers(
    page: number,
    pageSize: number,
    filters?: CustomerFilters
  ): PaginatedResponse<Customer> {
    let filteredCustomers = [...mockCustomers]

    if (filters?.status) {
      filteredCustomers = filteredCustomers.filter(c => c.status === filters.status)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(
        c =>
          c.firstName.toLowerCase().includes(search) ||
          c.lastName.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.company?.toLowerCase().includes(search)
      )
    }

    const total = filteredCustomers.length
    const start = (page - 1) * pageSize
    const data = filteredCustomers.slice(start, start + pageSize)

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    if (this.useMock) {
      return mockCustomers.find(c => c.id === id) || null
    }
    return httpClient.get<Customer>(`/customers/${id}`)
  }

  async getCustomerStats(): Promise<CustomerStats> {
    if (this.useMock) {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      return {
        totalCustomers: mockCustomers.length,
        activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
        newCustomersThisMonth: mockCustomers.filter(
          c => new Date(c.createdAt) >= thisMonth
        ).length,
        averageOrdersPerCustomer:
          mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0) / mockCustomers.length
      }
    }
    return httpClient.get<CustomerStats>('/customers/stats')
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    if (this.useMock) {
      const newCustomer: Customer = {
        id: String(mockCustomers.length + 1),
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...customer
      } as Customer
      mockCustomers.push(newCustomer)
      return newCustomer
    }
    return httpClient.post<Customer>('/customers', customer)
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    if (this.useMock) {
      const customer = mockCustomers.find(c => c.id === id)
      if (customer) {
        Object.assign(customer, data, { updatedAt: new Date().toISOString() })
        return customer
      }
      throw new Error('Customer not found')
    }
    return httpClient.put<Customer>(`/customers/${id}`, data)
  }

  async deleteCustomer(id: string): Promise<void> {
    if (this.useMock) {
      const index = mockCustomers.findIndex(c => c.id === id)
      if (index > -1) {
        mockCustomers.splice(index, 1)
      }
      return
    }
    return httpClient.delete(`/customers/${id}`)
  }
}

export const customerService = new CustomerService()
