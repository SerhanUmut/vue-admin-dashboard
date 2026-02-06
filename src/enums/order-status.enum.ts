/**
 * Order Status Enum
 * Represents the lifecycle states of an order in the system
 * 
 * @example
 * const status = OrderStatus.Pending // 'PENDING'
 */
export enum OrderStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED'
}

/**
 * UI mapping for order statuses
 * Provides label and color information for rendering status badges
 */
export const OrderStatusMap: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.Pending]: { label: 'Pending', color: 'warning' },
  [OrderStatus.Approved]: { label: 'Approved', color: 'primary' },
  [OrderStatus.Shipped]: { label: 'Shipped', color: 'info' },
  [OrderStatus.Delivered]: { label: 'Delivered', color: 'success' },
  [OrderStatus.Cancelled]: { label: 'Cancelled', color: 'danger' }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: OrderStatus): string {
  return OrderStatusMap[status]?.label || status
}

/**
 * Get status color for UI components
 */
export function getStatusColor(status: OrderStatus): string {
  return OrderStatusMap[status]?.color || 'secondary'
}

/**
 * Valid status transitions map
 * Defines which status can transition to which other statuses
 */
export const StatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Approved, OrderStatus.Cancelled],
  [OrderStatus.Approved]: [OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Cancelled],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: []
}

/**
 * Get available next statuses for a given status
 */
export function getNextStatusOptions(currentStatus: OrderStatus): OrderStatus[] {
  return StatusTransitions[currentStatus] || []
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return StatusTransitions[from]?.includes(to) || false
}

/**
 * Get all statuses as select options
 */
export function getStatusSelectOptions(): { value: OrderStatus; label: string }[] {
  return Object.values(OrderStatus).map(status => ({
    value: status,
    label: OrderStatusMap[status].label
  }))
}
