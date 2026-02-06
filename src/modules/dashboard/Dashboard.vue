<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import { 
  ElCard, 
  ElRow, 
  ElCol, 
  ElTable, 
  ElTableColumn, 
  ElTag, 
  ElStatistic,
  ElSkeleton,
  ElEmpty
} from 'element-plus'
import { useOrderStore, useCustomerStore } from '@/stores'
import { OrderStatus, OrderStatusMap } from '@/enums/order-status.enum'
import type { Order } from '@/types'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const router = useRouter()
const { t } = useI18n()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()

const isLoading = ref(true)

// Stats computed
const totalOrders = computed(() => orderStore.stats?.totalOrders || 0)
const totalRevenue = computed(() => orderStore.stats?.totalRevenue || 0)
const pendingOrders = computed(() => orderStore.stats?.pendingOrders || 0)
const totalCustomers = computed(() => customerStore.stats?.totalCustomers || 0)
const averageOrderValue = computed(() => orderStore.stats?.averageOrderValue || 0)

// Recent orders (last 5)
const recentOrders = computed(() => orderStore.recentOrders)

// Orders by status for chart
const ordersByStatus = computed(() => {
  const statusCounts: Record<OrderStatus, number> = {
    [OrderStatus.Pending]: 0,
    [OrderStatus.Approved]: 0,
    [OrderStatus.Shipped]: 0,
    [OrderStatus.Delivered]: 0,
    [OrderStatus.Cancelled]: 0
  }
  
  orderStore.orders.forEach(order => {
    statusCounts[order.status]++
  })
  
  return statusCounts
})

// Doughnut chart data - Orders by Status
const doughnutChartData = computed(() => ({
  labels: Object.values(OrderStatus).map(s => OrderStatusMap[s].label),
  datasets: [
    {
      data: Object.values(ordersByStatus.value),
      backgroundColor: [
        '#f59e0b', // Pending - warning
        '#3b82f6', // Approved - info
        '#6366f1', // Shipped - primary
        '#10b981', // Delivered - success
        '#ef4444'  // Cancelled - danger
      ],
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}))

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0
          return `${context.label}: ${context.raw} (${percentage}%)`
        }
      }
    }
  },
  cutout: '65%'
}

// Bar chart data - Revenue by Month (mock data)
const barChartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue ($)',
      data: [4500, 5200, 4800, 6100, 5800, totalRevenue.value / 2],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
      barThickness: 32
    }
  ]
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `$${context.raw.toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        callback: (value: string | number) => `$${Number(value).toLocaleString()}`
      }
    }
  }
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Get tag type for status
function getStatusTagType(status: OrderStatus): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const color = OrderStatusMap[status]?.color || 'primary'
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    success: 'success',
    warning: 'warning',
    info: 'info',
    danger: 'danger',
    primary: 'primary'
  }
  return colorMap[color] || 'primary'
}

// Get status label
function getStatusLabel(status: OrderStatus): string {
  return OrderStatusMap[status]?.label || status
}

// Navigate to order details
function viewOrder(order: Order): void {
  router.push(`/orders?id=${order.id}`)
}

// Navigate to orders page
function viewAllOrders(): void {
  router.push('/orders')
}

// Load data
onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      orderStore.fetchOrders(1),
      orderStore.fetchStats(),
      customerStore.fetchCustomers(1),
      customerStore.fetchStats()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="page-subtitle">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <el-tag type="info" size="large">
          <el-icon><Calendar /></el-icon>
          {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </el-tag>
      </div>
    </div>

    <!-- Summary Cards -->
    <el-row :gutter="24" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <el-skeleton :loading="isLoading" animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="h1" style="width: 70%; margin-top: 12px" />
            </template>
            <template #default>
              <div class="stat-content">
                <div class="stat-icon orders">
                  <el-icon :size="24"><ShoppingCart /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ t('dashboard.totalOrders') }}</span>
                  <el-statistic :value="totalOrders" />
                </div>
              </div>
              <div class="stat-footer">
                <span class="trend positive">
                  <el-icon><Top /></el-icon>
                  12.5%
                </span>
                <span class="trend-label">{{ t('dashboard.vsLastMonth') }}</span>
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <el-skeleton :loading="isLoading" animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="h1" style="width: 70%; margin-top: 12px" />
            </template>
            <template #default>
              <div class="stat-content">
                <div class="stat-icon revenue">
                  <el-icon :size="24"><Money /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ t('dashboard.totalRevenue') }}</span>
                  <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
                </div>
              </div>
              <div class="stat-footer">
                <span class="trend positive">
                  <el-icon><Top /></el-icon>
                  8.2%
                </span>
                <span class="trend-label">{{ t('dashboard.vsLastMonth') }}</span>
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <el-skeleton :loading="isLoading" animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="h1" style="width: 70%; margin-top: 12px" />
            </template>
            <template #default>
              <div class="stat-content">
                <div class="stat-icon pending">
                  <el-icon :size="24"><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ t('dashboard.pendingOrders') }}</span>
                  <el-statistic :value="pendingOrders" />
                </div>
              </div>
              <div class="stat-footer">
                <span class="trend negative">
                  <el-icon><Bottom /></el-icon>
                  3.1%
                </span>
                <span class="trend-label">{{ t('dashboard.vsLastMonth') }}</span>
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <el-skeleton :loading="isLoading" animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="h1" style="width: 70%; margin-top: 12px" />
            </template>
            <template #default>
              <div class="stat-content">
                <div class="stat-icon customers">
                  <el-icon :size="24"><User /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ t('dashboard.totalCustomers') }}</span>
                  <el-statistic :value="totalCustomers" />
                </div>
              </div>
              <div class="stat-footer">
                <span class="trend positive">
                  <el-icon><Top /></el-icon>
                  5.3%
                </span>
                <span class="trend-label">{{ t('dashboard.vsLastMonth') }}</span>
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="24" class="charts-row">
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">Orders by Status</span>
              <el-tag size="small" type="info">This Month</el-tag>
            </div>
          </template>
          <div class="chart-container doughnut">
            <el-skeleton :loading="isLoading" animated>
              <template #template>
                <div class="skeleton-chart"></div>
              </template>
              <template #default>
                <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
              </template>
            </el-skeleton>
          </div>
          <div class="chart-summary">
            <div class="summary-item">
              <span class="summary-label">Average Order Value</span>
              <span class="summary-value">{{ formatCurrency(averageOrderValue) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">Revenue Overview</span>
              <el-tag size="small" type="success">+18.2% growth</el-tag>
            </div>
          </template>
          <div class="chart-container bar">
            <el-skeleton :loading="isLoading" animated>
              <template #template>
                <div class="skeleton-chart"></div>
              </template>
              <template #default>
                <Bar :data="barChartData" :options="barChartOptions" />
              </template>
            </el-skeleton>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Orders Table -->
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ t('dashboard.recentOrders') }}</span>
              <el-button type="primary" link @click="viewAllOrders">
                {{ t('common.viewAll') }}
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          
          <el-skeleton :loading="isLoading" animated :rows="5">
            <template #default>
              <el-table 
                :data="recentOrders" 
                style="width: 100%"
                :empty-text="'No recent orders'"
                row-class-name="clickable-row"
                @row-click="viewOrder"
              >
                <el-table-column prop="orderNumber" label="Order #" width="140">
                  <template #default="{ row }">
                    <span class="order-number">{{ row.orderNumber }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="customerName" label="Customer" min-width="180">
                  <template #default="{ row }">
                    <div class="customer-cell">
                      <el-avatar :size="32" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.customerName}`" />
                      <div class="customer-info">
                        <span class="customer-name">{{ row.customerName }}</span>
                        <span class="customer-email">{{ row.customerEmail }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="total" label="Total" width="120" align="right">
                  <template #default="{ row }">
                    <span class="order-total">{{ formatCurrency(row.total) }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="status" label="Status" width="130" align="center">
                  <template #default="{ row }">
                    <el-tag 
                      :type="getStatusTagType(row.status)" 
                      effect="light"
                      round
                    >
                      {{ getStatusLabel(row.status as OrderStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column prop="createdAt" label="Date" width="140" align="right">
                  <template #default="{ row }">
                    <span class="order-date">{{ formatDate(row.createdAt) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-skeleton>

          <el-empty v-if="!isLoading && recentOrders.length === 0" description="No orders yet" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 1400px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Stats Row */
.stats-row {
  margin-bottom: 1.5rem;
}

.stat-card {
  height: 100%;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card :deep(.el-card__body) {
  padding: 1.25rem;
}

.stat-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-icon.customers {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  line-height: 1.2;
}

.stat-card :deep(.el-statistic__content) {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #f3f4f6);
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.trend.positive {
  color: #10b981;
}

.trend.negative {
  color: #ef4444;
}

.trend-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

/* Charts Row */
.charts-row {
  margin-bottom: 1.5rem;
}

.chart-card {
  height: 100%;
  border-radius: 12px;
}

.chart-card :deep(.el-card__header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #f3f4f6);
}

.chart-card :deep(.el-card__body) {
  padding: 1.25rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.chart-container {
  position: relative;
}

.chart-container.doughnut {
  height: 280px;
}

.chart-container.bar {
  height: 300px;
}

.skeleton-chart {
  height: 250px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.chart-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #f3f4f6);
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

/* Table Card */
.table-card {
  border-radius: 12px;
}

.table-card :deep(.el-card__header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #f3f4f6);
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-card :deep(.el-table) {
  --el-table-border-color: transparent;
}

.table-card :deep(.el-table th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
}

.table-card :deep(.clickable-row) {
  cursor: pointer;
}

.table-card :deep(.clickable-row:hover) {
  background-color: #f9fafb;
}

.order-number {
  font-weight: 600;
  color: var(--primary, #3b82f6);
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.customer-email {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.order-total {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.order-date {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-row :deep(.el-col) {
    margin-bottom: 1rem;
  }
  
  .charts-row :deep(.el-col) {
    margin-bottom: 1rem;
  }
  
  .page-header {
    flex-direction: column;
  }
}
</style>
