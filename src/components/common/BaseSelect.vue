<script setup lang="ts">
import { computed } from 'vue'
import type { SelectOption } from '@/types'

interface Props {
  modelValue: string | number | null
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectId = computed(() => props.id || `select-${Math.random().toString(36).slice(2, 9)}`)

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="base-select" :class="{ 'has-error': error }">
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue ?? ''"
        :disabled="disabled"
        :required="required"
        class="select-field"
        @change="handleChange"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <span class="select-icon">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <p v-if="error" class="select-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.select-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.required-mark {
  color: #ef4444;
  margin-left: 0.125rem;
}

.select-wrapper {
  position: relative;
}

.select-field {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.875rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
  background: white;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  cursor: pointer;
  appearance: none;
  transition: all 0.15s ease;
}

.select-field:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.has-error .select-field {
  border-color: #ef4444;
}

.has-error .select-field:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select-field:disabled {
  background-color: var(--disabled-bg, #f3f4f6);
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary, #6b7280);
  pointer-events: none;
}

.select-error {
  font-size: 0.8125rem;
  color: #ef4444;
  margin: 0;
}
</style>
