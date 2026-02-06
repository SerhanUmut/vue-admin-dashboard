<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '@/types'

interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
}

const props = defineProps<Props>()

const hasBreadcrumbs = computed(() => props.breadcrumbs && props.breadcrumbs.length > 0)
</script>

<template>
  <div class="page-header">
    <nav v-if="hasBreadcrumbs" class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li v-for="(item, index) in breadcrumbs" :key="index">
          <router-link v-if="item.route && index < breadcrumbs!.length - 1" :to="item.route">
            {{ item.label }}
          </router-link>
          <span v-else class="current">{{ item.label }}</span>
          <span v-if="index < breadcrumbs!.length - 1" class="separator">/</span>
        </li>
      </ol>
    </nav>
    
    <div class="header-content">
      <div class="header-text">
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}

.breadcrumbs {
  margin-bottom: 0.75rem;
}

.breadcrumbs ol {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.breadcrumbs li {
  display: flex;
  align-items: center;
}

.breadcrumbs a {
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  transition: color 0.15s ease;
}

.breadcrumbs a:hover {
  color: var(--primary, #3b82f6);
}

.breadcrumbs .current {
  color: var(--text-primary, #1f2937);
  font-weight: 500;
}

.breadcrumbs .separator {
  margin: 0 0.5rem;
  color: var(--text-secondary, #9ca3af);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 200px;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0;
  line-height: 1.3;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.9375rem;
  color: var(--text-secondary, #6b7280);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
