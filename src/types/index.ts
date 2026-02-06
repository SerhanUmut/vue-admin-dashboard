export * from './order'
export * from './customer'
export * from './auth'

export interface TableColumn<T = unknown> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: unknown, row: T) => string
}

export interface SortState {
  field: string | null
  direction: 'asc' | 'desc'
}

export interface TablePagination {
  page: number
  pageSize: number
  total: number
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  route?: string
  children?: MenuItem[]
  permission?: string
}

export interface BreadcrumbItem {
  label: string
  route?: string
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
}
