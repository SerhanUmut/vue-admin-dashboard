<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores'
import { BaseModal, StatusBadge, BaseButton, BaseSelect } from '@/components/common'
import { 
  OrderStatus, 
  OrderStatusMap,
  getNextStatusOptions 
} from '@/enums/order-status.enum'
import type { Order, SelectOption } from '@/types'

interface Props {
  modelValue: boolean
  order: Order | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const { t } = useI18n()
const orderStore = useOrderStore()

// Computed for v-model binding
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Available status transitions for current order
const availableStatusOptions = computed<SelectOption[]>(() => {
  if (!props.order) return []
  
  const currentStatus = props.order.status
  const transitions = getNextStatusOptions(currentStatus)
  
  // Include current status and available transitions
  return [
    { value: currentStatus, label: OrderStatusMap[currentStatus].label },
    ...transitions.map(status => ({
      value: status,
      label: OrderStatusMap[status].label
    }))
  ]
})

/**
 * Get status badge variant
 */
function getStatusVariant(status: OrderStatus): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' {
  const color = OrderStatusMap[status]?.color || 'secondary'
  const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info'
  }
  return colorMap[color] || 'secondary'
}

/**
 * Get status label
 */
function getStatusLabel(status: OrderStatus): string {
  return OrderStatusMap[status]?.label || status
}

/**
 * Handle status change
 */
async function handleStatusChange(status: string | number | null): Promise<void> {
  if (props.order && status && status !== props.order.status) {
    await orderStore.updateStatus(props.order.id, status as OrderStatus)
  }
}

/**
 * Format date string
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Get status timeline for order
 */
function getStatusTimeline(status: OrderStatus): { label: string; completed: boolean; current: boolean }[] {
  const statuses = [
    OrderStatus.Pending,
    OrderStatus.Approved,
    OrderStatus.Shipped,
    OrderStatus.Delivered
  ]
  
  const currentIndex = statuses.indexOf(status)
  const isCancelled = status === OrderStatus.Cancelled
  
  return statuses.map((s, index) => ({
    label: OrderStatusMap[s].label,
    completed: !isCancelled && index < currentIndex,
    current: s === status
  }))
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="order ? `${t('orders.orderDetails')} - ${order.orderNumber}` : t('orders.orderDetails')"
    size="lg"
    @close="emit('close')"
  >
    <div v-if="order" class="order-detail">
      <!-- Status Timeline -->
      <div v-if="order.status !== OrderStatus.Cancelled" class="status-timeline">
        <div
          v-for="(step, index) in getStatusTimeline(order.status)"
          :key="step.label"
          class="timeline-step"
          :class="{ completed: step.completed, current: step.current }"
        >
          <div class="step-indicator">
            <svg v-if="step.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>

      <!-- Cancelled Banner -->
      <div v-if="order.status === OrderStatus.Cancelled" class="cancelled-banner">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>This order has been cancelled</span>
      </div>

      <!-- Header with Status -->
      <div class="detail-header">
        <div class="status-section">
          <label class="field-label">{{ t('orders.status') }}</label>
          <div class="status-control">
            <StatusBadge
              :status="getStatusLabel(order.status)"
              :variant="getStatusVariant(order.status)"
              size="lg"
              dot
            />
            <BaseSelect
              v-if="availableStatusOptions.length > 1"
              :model-value="order.status"
              :options="availableStatusOptions"
              @update:model-value="handleStatusChange"
            />
          </div>
        </div>
        <div class="dates-section">
          <div class="date-item">
            <span class="date-label">{{ t('common.created') }}:</span>
            <span class="date-value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">{{ t('common.updated') }}:</span>
            <span class="date-value">{{ formatDate(order.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="detail-grid">
        <!-- Customer Info -->
        <div class="detail-card">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 16C3 12.134 5.686 9 9 9C12.314 9 15 12.134 15 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ t('orders.customerInfo') }}
          </h3>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ t('customers.name') }}</span>
              <span class="info-value">{{ order.customerName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('customers.email') }}</span>
              <span class="info-value">{{ order.customerEmail }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="detail-card">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 9.5C10.1046 9.5 11 8.60457 11 7.5C11 6.39543 10.1046 5.5 9 5.5C7.89543 5.5 7 6.39543 7 7.5C7 8.60457 7.89543 9.5 9 9.5Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9 16C9 16 15 11.5 15 7.5C15 4.18629 12.3137 1.5 9 1.5C5.68629 1.5 3 4.18629 3 7.5C3 11.5 9 16 9 16Z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            {{ t('orders.shippingAddress') }}
          </h3>
          <div class="address">
            <p>{{ order.shippingAddress.street }}</p>
            <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
            <p>{{ order.shippingAddress.country }}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="detail-card">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8H16" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Payment Method
          </h3>
          <div class="payment-method">
            {{ order.paymentMethod }}
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="detail-card full-width">
        <h3 class="card-title">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ t('orders.items') }} ({{ order.items.length }})
        </h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>{{ t('orders.product') }}</th>
              <th class="text-center">{{ t('orders.quantity') }}</th>
              <th class="text-right">{{ t('orders.unitPrice') }}</th>
              <th class="text-right">{{ t('orders.totalPrice') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>
                <span class="product-name">{{ item.productName }}</span>
                <span class="product-id">SKU: {{ item.productId }}</span>
              </td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="text-right font-medium">{{ formatCurrency(item.totalPrice) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Order Summary -->
        <div class="order-summary">
          <div class="summary-row">
            <span>{{ t('orders.subtotal') }}</span>
            <span>{{ formatCurrency(order.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ t('orders.tax') }} (10%)</span>
            <span>{{ formatCurrency(order.tax) }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ t('orders.total') }}</span>
            <span>{{ formatCurrency(order.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="order.notes" class="detail-card full-width">
        <h3 class="card-title">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14 2H4C3.44772 2 3 2.44772 3 3V15C3 15.5523 3.44772 16 4 16H14C14.5523 16 15 15.5523 15 15V3C15 2.44772 14.5523 2 14 2Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 6H12M6 9H12M6 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ t('orders.notes') }}
        </h3>
        <p class="notes-text">{{ order.notes }}</p>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="isOpen = false">
        {{ t('common.close') }}
      </BaseButton>
      <BaseButton variant="outline">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem">
          <path d="M13 5V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M5 11L11 5M11 5H7M11 5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Export PDF
      </BaseButton>
      <BaseButton variant="primary">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem">
          <path d="M4 12V14H12V12M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('orders.printInvoice') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Status Timeline */
.status-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(to right, #f0fdf4, #ecfdf5, #f0f9ff, #eff6ff);
  border-radius: 8px;
  position: relative;
}

.status-timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: #e5e7eb;
  transform: translateY(-50%);
  z-index: 0;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.timeline-step.completed .step-indicator {
  background: #059669;
  border-color: #059669;
  color: white;
}

.timeline-step.current .step-indicator {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.step-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.timeline-step.completed .step-label,
.timeline-step.current .step-label {
  color: #1f2937;
}

/* Cancelled Banner */
.cancelled-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-weight: 500;
}

/* Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.status-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dates-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
}

.date-item {
  font-size: 0.8125rem;
}

.date-label {
  color: var(--text-secondary, #6b7280);
  margin-right: 0.25rem;
}

.date-value {
  color: var(--text-primary, #1f2937);
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  padding: 1rem;
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.75rem 0;
}

.card-title svg {
  color: var(--text-secondary, #6b7280);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.info-label {
  color: var(--text-secondary, #6b7280);
}

.info-value {
  color: var(--text-primary, #1f2937);
  font-weight: 500;
}

.address {
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  line-height: 1.5;
}

.address p {
  margin: 0;
}

.payment-method {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.items-table th {
  text-align: left;
  padding: 0.75rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.items-table td {
  padding: 0.75rem;
  color: var(--text-primary, #1f2937);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  vertical-align: middle;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.product-name {
  display: block;
  font-weight: 500;
}

.product-id {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  margin-top: 0.125rem;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.font-medium { font-weight: 500; }

/* Order Summary */
.order-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.summary-row.total {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 2px solid var(--border-color, #e5e7eb);
}

.notes-text {
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
