<script setup lang="ts" generic="T extends Record<string, unknown> & { id?: string }">
import { computed } from 'vue'
import type { TableColumn, TablePagination } from '@/types'

interface SortState {
  field: string | null
  direction: 'asc' | 'desc'
}

interface Props {
  columns: TableColumn<T>[]
  data: T[]
  pagination?: TablePagination
  loading?: boolean
  emptyText?: string
  striped?: boolean
  hoverable?: boolean
  selectable?: boolean
  selectedIds?: string[]
  sortable?: boolean
  currentSort?: SortState
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'No data available',
  striped: true,
  hoverable: true,
  selectable: false,
  selectedIds: () => [],
  sortable: false,
  currentSort: () => ({ field: null, direction: 'desc' })
})

const emit = defineEmits<{
  pageChange: [page: number]
  rowClick: [row: T]
  selectionChange: [ids: string[]]
  sort: [field: string, direction: 'asc' | 'desc']
}>()

const totalPages = computed(() => {
  if (!props.pagination) return 0
  return Math.ceil(props.pagination.total / props.pagination.pageSize)
})

const pageNumbers = computed(() => {
  if (!props.pagination) return []
  const current = props.pagination.page
  const total = totalPages.value
  const pages: (number | string)[] = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const allSelected = computed(() => {
  if (!props.selectable || props.data.length === 0) return false
  return props.data.every(row => row.id && props.selectedIds.includes(row.id))
})

function getCellValue(row: T, column: TableColumn<T>): string {
  const value = row[column.key as keyof T]
  if (column.formatter) {
    return column.formatter(value, row)
  }
  return String(value ?? '')
}

function handlePageChange(page: number): void {
  if (page >= 1 && page <= totalPages.value) {
    emit('pageChange', page)
  }
}

function handleRowClick(row: T): void {
  emit('rowClick', row)
}

function toggleSelection(id: string): void {
  const newSelection = props.selectedIds.includes(id)
    ? props.selectedIds.filter(i => i !== id)
    : [...props.selectedIds, id]
  emit('selectionChange', newSelection)
}

function toggleAllSelection(): void {
  if (allSelected.value) {
    emit('selectionChange', [])
  } else {
    emit('selectionChange', props.data.map(row => row.id || '').filter(Boolean))
  }
}

function handleSort(column: TableColumn<T>): void {
  if (!props.sortable || !column.sortable) return
  
  const field = String(column.key)
  const newDirection = 
    props.currentSort.field === field && props.currentSort.direction === 'asc' 
      ? 'desc' 
      : 'asc'
  
  emit('sort', field, newDirection)
}

function getSortIcon(column: TableColumn<T>): string {
  if (!column.sortable) return ''
  if (props.currentSort.field !== String(column.key)) return 'sortable'
  return props.currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc'
}
</script>

<template>
  <div class="base-table">
    <div class="table-wrapper">
      <table :class="{ striped, hoverable }">
        <thead>
          <tr>
            <th v-if="selectable" class="checkbox-cell">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="selectedIds.length > 0 && !allSelected"
                @change="toggleAllSelection"
              />
            </th>
            <th
              v-for="column in columns"
              :key="String(column.key)"
              :style="{ width: column.width }"
              :class="[
                `align-${column.align || 'left'}`,
                { sortable: sortable && column.sortable }
              ]"
              @click="handleSort(column)"
            >
              <div class="th-content">
                <span>{{ column.label }}</span>
                <span v-if="sortable && column.sortable" class="sort-icon" :class="getSortIcon(column)">
                  <svg v-if="getSortIcon(column) === 'sortable'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3L10 6H4L7 3Z" fill="currentColor" opacity="0.3"/>
                    <path d="M7 11L4 8H10L7 11Z" fill="currentColor" opacity="0.3"/>
                  </svg>
                  <svg v-else-if="getSortIcon(column) === 'sort-asc'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3L10 6H4L7 3Z" fill="currentColor"/>
                    <path d="M7 11L4 8H10L7 11Z" fill="currentColor" opacity="0.3"/>
                  </svg>
                  <svg v-else-if="getSortIcon(column) === 'sort-desc'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3L10 6H4L7 3Z" fill="currentColor" opacity="0.3"/>
                    <path d="M7 11L4 8H10L7 11Z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Loading...</span>
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="empty-cell">
              {{ emptyText }}
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, index) in data"
              :key="row.id || index"
              :class="{ selected: row.id && selectedIds.includes(row.id) }"
              @click="handleRowClick(row)"
            >
              <td v-if="selectable" class="checkbox-cell" @click.stop>
                <input
                  type="checkbox"
                  :checked="row.id ? selectedIds.includes(row.id) : false"
                  @change="row.id && toggleSelection(row.id)"
                />
              </td>
              <td
                v-for="column in columns"
                :key="String(column.key)"
                :class="[`align-${column.align || 'left'}`]"
              >
                <slot :name="`cell-${String(column.key)}`" :row="row" :value="row[column.key as keyof T]">
                  {{ getCellValue(row, column) }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="pagination && totalPages > 1" class="pagination">
      <div class="pagination-info">
        Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
        {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} of 
        {{ pagination.total }} entries
      </div>
      <div class="pagination-controls">
        <button
          class="page-btn"
          :disabled="pagination.page === 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          Previous
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-btn"
          :class="{ active: page === pagination.page, dots: page === '...' }"
          :disabled="page === '...'"
          @click="typeof page === 'number' && handlePageChange(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="pagination.page === totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-table {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background-color: var(--table-header-bg, #f9fafb);
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  white-space: nowrap;
  user-select: none;
}

th.sortable {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

th.sortable:hover {
  background-color: var(--table-row-hover-bg, #f3f4f6);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  display: flex;
  align-items: center;
  color: var(--text-secondary, #9ca3af);
  transition: color 0.15s ease;
}

.sort-icon.sort-asc,
.sort-icon.sort-desc {
  color: var(--primary, #3b82f6);
}

td {
  padding: 0.75rem 1rem;
  color: var(--text-primary, #1f2937);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

tbody tr:last-child td {
  border-bottom: none;
}

.striped tbody tr:nth-child(even) {
  background-color: var(--table-row-alt-bg, #f9fafb);
}

.hoverable tbody tr:hover {
  background-color: var(--table-row-hover-bg, #f3f4f6);
  cursor: pointer;
}

tr.selected {
  background-color: var(--primary-light, #eff6ff) !important;
}

.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }

.align-right .th-content {
  justify-content: flex-end;
}

.align-center .th-content {
  justify-content: center;
}

.checkbox-cell {
  width: 40px;
  padding: 0.75rem;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary, #6b7280);
}

.loading-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled):not(.dots) {
  background-color: var(--table-row-hover-bg, #f3f4f6);
  border-color: var(--primary, #3b82f6);
}

.page-btn.active {
  background-color: var(--primary, #3b82f6);
  border-color: var(--primary, #3b82f6);
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.dots {
  border: none;
  background: none;
}
</style>
