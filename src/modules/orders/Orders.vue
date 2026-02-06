<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores'
import { PageHeader, BaseTable, StatusBadge, BaseButton, BaseInput, BaseSelect } from '@/components/common'
import OrderDetailDialog from './OrderDetailDialog.vue'
import { OrderStatus, OrderStatusMap, getStatusSelectOptions } from '@/enums/order-status.enum'
import type { Order, TableColumn, SelectOption } from '@/types'

const { t } = useI18n()
const orderStore = useOrderStore()

// Local state
const showDetailDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const searchQuery = ref('')
const statusFilter = ref<OrderStatus | null>(null)

// Table columns with sortable configuration
const columns = computed<TableColumn<Order>[]>(() => [
  { key: 'orderNumber', label: t('orders.orderNumber'), width: '140px', sortable: true },
  { key: 'customerName', label: t('orders.customer'), sortable: true },
  { key: 'customerEmail', label: t('orders.email'), sortable: true },
  { key: 'total', label: t('orders.total'), align: 'right', sortable: true, formatter: (val) => `$${Number(val).toFixed(2)}` },
  { key: 'status', label: t('orders.status'), width: '130px', sortable: true },
  { key: 'createdAt', label: t('common.date'), width: '140px', sortable: true, formatter: (val) => new Date(String(val)).toLocaleDateString() }
])

// Status filter options
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('orders.allStatuses') },
  ...getStatusSelectOptions()
])

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: t('menu.dashboard'), route: '/dashboard' },
  { label: t('menu.orders') }
])

// Current sort state for table
const currentSort = computed(() => ({
  field: orderStore.sorting.field as string | null,
  direction: orderStore.sorting.direction
}))

/**
 * Map status to badge variant
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
 * Handle row click to show order details
 */
function handleRowClick(order: Order): void {
  selectedOrder.value = order
  showDetailDialog.value = true
}

/**
 * Handle pagination
 */
function handlePageChange(page: number): void {
  orderStore.setPage(page)
  orderStore.fetchOrders(page)
}

/**
 * Handle column sorting
 */
function handleSort(field: string, direction: 'asc' | 'desc'): void {
  orderStore.setSorting(field as keyof Order, direction)
  orderStore.fetchOrders(1)
}

/**
 * Handle search
 */
function handleSearch(): void {
  orderStore.setFilters({ search: searchQuery.value })
  orderStore.fetchOrders(1)
}

/**
 * Handle status filter change
 */
function handleStatusChange(status: string | number | null): void {
  statusFilter.value = (status || null) as OrderStatus | null
  orderStore.setFilters({ status: statusFilter.value })
  orderStore.fetchOrders(1)
}

/**
 * Clear all filters
 */
function clearFilters(): void {
  searchQuery.value = ''
  statusFilter.value = null
  orderStore.clearFilters()
  orderStore.fetchOrders(1)
}

/**
 * Handle dialog close
 */
function handleDialogClose(): void {
  selectedOrder.value = null
}

// Watch for currentOrder changes from store
watch(() => orderStore.currentOrder, (order) => {
  if (order) {
    selectedOrder.value = order
  }
})

// Fetch orders on mount
onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<template>
  <div class="orders-page">
    <!-- Page Header -->
    <PageHeader
      :title="t('orders.title')"
      :subtitle="t('orders.subtitle')"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="orderStore.fetchOrders()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem">
            <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8 2V5L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('common.refresh') || 'Refresh' }}
        </BaseButton>
        <BaseButton variant="primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ t('orders.newOrder') }}
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="filter-group">
        <BaseInput
          v-model="searchQuery"
          type="search"
          :placeholder="t('orders.searchPlaceholder')"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="search-icon">
              <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M15 15L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </BaseInput>
        
        <BaseSelect
          :model-value="statusFilter"
          :options="statusOptions"
          :placeholder="t('orders.filterByStatus')"
          @update:model-value="handleStatusChange"
        />
        
        <BaseButton 
          v-if="orderStore.hasFilters" 
          variant="ghost" 
          size="sm"
          @click="clearFilters"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 0.375rem">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ t('common.clearFilters') }}
        </BaseButton>
      </div>
      
      <div class="filter-info">
        <span class="count">{{ orderStore.pagination.total }}</span> 
        {{ t('orders.orders') }}
        <span v-if="orderStore.hasFilters" class="filtered-text">
          ({{ t('common.showing') }} {{ orderStore.orders.length }} {{ t('common.filtered') || 'filtered' }})
        </span>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <BaseTable
        :columns="columns"
        :data="orderStore.orders"
        :pagination="{
          page: orderStore.pagination.page,
          pageSize: orderStore.pagination.pageSize,
          total: orderStore.pagination.total
        }"
        :loading="orderStore.isLoading"
        :sortable="true"
        :current-sort="currentSort"
        @row-click="handleRowClick"
        @page-change="handlePageChange"
        @sort="handleSort"
      >
        <template #cell-status="{ row }">
          <StatusBadge
            :status="getStatusLabel((row as Order).status)"
            :variant="getStatusVariant((row as Order).status)"
            dot
          />
        </template>
      </BaseTable>
    </div>

    <!-- Error Message -->
    <div v-if="orderStore.error" class="error-message">
      <span>{{ orderStore.error }}</span>
      <button @click="orderStore.clearError">Dismiss</button>
    </div>

    <!-- Order Detail Dialog -->
    <OrderDetailDialog
      v-model="showDetailDialog"
      :order="selectedOrder"
      @close="handleDialogClose"
    />
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 1400px;
}

.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-group :deep(.base-input),
.filter-group :deep(.base-select) {
  min-width: 200px;
}

.search-icon {
  margin-left: 0.75rem;
  color: #9ca3af;
}

.filter-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.filter-info .count {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.filter-info .filtered-text {
  color: var(--text-muted, #9ca3af);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dc2626;
  font-size: 0.875rem;
}

.error-message button {
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group :deep(.base-input),
  .filter-group :deep(.base-select) {
    min-width: 100%;
    flex: 1;
  }
  
  .filter-info {
    text-align: center;
  }
}
</style>
