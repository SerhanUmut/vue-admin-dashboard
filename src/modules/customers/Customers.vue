<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCustomerStore } from '@/stores'
import { PageHeader, BaseTable, StatusBadge, BaseButton, BaseInput, BaseSelect } from '@/components/common'
import type { Customer, TableColumn, SelectOption, CustomerStatus } from '@/types'

const { t } = useI18n()
const customerStore = useCustomerStore()

const searchQuery = ref('')
const statusFilter = ref<CustomerStatus | null>(null)

const columns: TableColumn<Customer>[] = [
  { key: 'avatar', label: '', width: '50px' },
  { key: 'name', label: t('customers.name'), formatter: (_, row) => `${(row as Customer).firstName} ${(row as Customer).lastName}` },
  { key: 'email', label: t('customers.email') },
  { key: 'phone', label: t('customers.phone') },
  { key: 'totalOrders', label: t('customers.orders'), align: 'center', width: '100px' },
  { key: 'totalSpent', label: t('customers.totalSpent'), align: 'right', formatter: (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
  { key: 'status', label: t('customers.status'), width: '100px' }
]

const statusOptions: SelectOption[] = [
  { value: '', label: t('customers.allStatuses') },
  { value: 'active', label: t('customers.statusActive') },
  { value: 'inactive', label: t('customers.statusInactive') },
  { value: 'blocked', label: t('customers.statusBlocked') }
]

const breadcrumbs = [
  { label: t('menu.dashboard'), route: '/dashboard' },
  { label: t('menu.customers') }
]

function getStatusVariant(status: CustomerStatus): 'success' | 'secondary' | 'danger' {
  const variants: Record<CustomerStatus, 'success' | 'secondary' | 'danger'> = {
    active: 'success',
    inactive: 'secondary',
    blocked: 'danger'
  }
  return variants[status]
}

function handlePageChange(page: number): void {
  customerStore.setPage(page)
  customerStore.fetchCustomers(page)
}

function handleSearch(): void {
  customerStore.setFilters({ search: searchQuery.value })
  customerStore.fetchCustomers(1)
}

function handleStatusChange(status: string | number | null): void {
  statusFilter.value = status as CustomerStatus | null
  customerStore.setFilters({ status: status as CustomerStatus | null })
  customerStore.fetchCustomers(1)
}

function clearFilters(): void {
  searchQuery.value = ''
  statusFilter.value = null
  customerStore.clearFilters()
  customerStore.fetchCustomers(1)
}

onMounted(() => {
  customerStore.fetchCustomers()
})
</script>

<template>
  <div class="customers-page">
    <PageHeader
      :title="t('customers.title')"
      :subtitle="t('customers.subtitle')"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <BaseButton variant="primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ t('customers.addCustomer') }}
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <BaseInput
          v-model="searchQuery"
          type="search"
          :placeholder="t('customers.searchPlaceholder')"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="margin-left: 0.75rem; color: #9ca3af">
              <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M15 15L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </BaseInput>
        <BaseSelect
          :model-value="statusFilter"
          :options="statusOptions"
          :placeholder="t('customers.filterByStatus')"
          @update:model-value="handleStatusChange"
        />
        <BaseButton v-if="customerStore.hasFilters" variant="ghost" @click="clearFilters">
          {{ t('common.clearFilters') }}
        </BaseButton>
      </div>
      <div class="filter-info">
        {{ t('common.showing') }} {{ customerStore.customers.length }} {{ t('common.of') }} {{ customerStore.pagination.total }} {{ t('customers.customers') }}
      </div>
    </div>

    <!-- Customers Table -->
    <div class="table-container">
      <BaseTable
        :columns="columns"
        :data="customerStore.customers"
        :pagination="{
          page: customerStore.pagination.page,
          pageSize: customerStore.pagination.pageSize,
          total: customerStore.pagination.total
        }"
        :loading="customerStore.isLoading"
        @page-change="handlePageChange"
      >
        <template #cell-avatar="{ row }">
          <div class="customer-avatar">
            <img v-if="(row as Customer).avatar" :src="(row as Customer).avatar" :alt="`${(row as Customer).firstName} ${(row as Customer).lastName}`" />
            <span v-else>{{ (row as Customer).firstName[0] }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :status="t(`customers.status${(row as Customer).status.charAt(0).toUpperCase() + (row as Customer).status.slice(1)}`)"
            :variant="getStatusVariant((row as Customer).status)"
            dot
          />
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<style scoped>
.customers-page {
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

.filter-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
}

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
