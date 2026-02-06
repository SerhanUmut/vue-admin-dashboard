<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: number
  trendLabel?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>

<template>
  <div class="stats-card" :class="[`card-${variant}`]">
    <div class="card-header">
      <span class="card-title">{{ title }}</span>
      <div v-if="icon" class="card-icon">
        <slot name="icon">{{ icon }}</slot>
      </div>
    </div>
    <div class="card-value">{{ value }}</div>
    <div v-if="subtitle || trend !== undefined" class="card-footer">
      <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
      <span v-if="trend !== undefined" class="card-trend" :class="{ positive: trend >= 0, negative: trend < 0 }">
        <svg v-if="trend >= 0" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 3V9M6 9L3 6M6 9L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ Math.abs(trend) }}%
        <span v-if="trendLabel" class="trend-label">{{ trendLabel }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}

.stats-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background-color: var(--icon-bg, #f3f4f6);
}

.card-default .card-icon { background-color: #f3f4f6; }
.card-primary .card-icon { background-color: #eff6ff; color: #3b82f6; }
.card-success .card-icon { background-color: #ecfdf5; color: #059669; }
.card-warning .card-icon { background-color: #fffbeb; color: #d97706; }
.card-danger .card-icon { background-color: #fef2f2; color: #dc2626; }
.card-info .card-icon { background-color: #f0f9ff; color: #0284c7; }

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  line-height: 1.2;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  gap: 0.5rem;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.card-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.card-trend.positive {
  color: #059669;
}

.card-trend.negative {
  color: #dc2626;
}

.trend-label {
  font-weight: 400;
  color: var(--text-secondary, #6b7280);
  margin-left: 0.25rem;
}
</style>
