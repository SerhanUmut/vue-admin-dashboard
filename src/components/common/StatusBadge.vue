<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  dot: false
})

const variantClasses = computed(() => {
  return `badge-${props.variant} badge-${props.size}`
})
</script>

<template>
  <span class="status-badge" :class="variantClasses">
    <span v-if="dot" class="badge-dot"></span>
    <slot>{{ status }}</slot>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
  border-radius: 9999px;
  text-transform: capitalize;
}

/* Sizes */
.badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.badge-md {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
}

.badge-lg {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
}

/* Variants */
.badge-primary {
  background-color: #eff6ff;
  color: #2563eb;
}

.badge-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.badge-success {
  background-color: #ecfdf5;
  color: #059669;
}

.badge-warning {
  background-color: #fffbeb;
  color: #d97706;
}

.badge-danger {
  background-color: #fef2f2;
  color: #dc2626;
}

.badge-info {
  background-color: #f0f9ff;
  color: #0284c7;
}

/* Dot indicator */
.badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-primary .badge-dot { background-color: #2563eb; }
.badge-secondary .badge-dot { background-color: #4b5563; }
.badge-success .badge-dot { background-color: #059669; }
.badge-warning .badge-dot { background-color: #d97706; }
.badge-danger .badge-dot { background-color: #dc2626; }
.badge-info .badge-dot { background-color: #0284c7; }
</style>
