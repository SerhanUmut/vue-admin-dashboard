<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="base-input" :class="{ 'has-error': error }">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="input-wrapper">
      <slot name="prefix"></slot>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="input-field"
        @input="handleInput"
      />
      <slot name="suffix"></slot>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
    <p v-else-if="hint" class="input-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.required-mark {
  color: #ef4444;
  margin-left: 0.125rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  transition: all 0.15s ease;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.has-error .input-wrapper {
  border-color: #ef4444;
}

.has-error .input-wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-field {
  flex: 1;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}

.input-field::placeholder {
  color: var(--text-secondary, #9ca3af);
}

.input-field:disabled {
  background-color: var(--disabled-bg, #f3f4f6);
  cursor: not-allowed;
}

.input-error {
  font-size: 0.8125rem;
  color: #ef4444;
  margin: 0;
}

.input-hint {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}
</style>
