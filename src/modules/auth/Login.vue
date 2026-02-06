<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

function validateForm(): boolean {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('auth.emailInvalid')
    isValid = false
  }

  if (!form.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  return isValid
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) return

  const success = await authStore.login({
    email: form.email,
    password: form.password,
    rememberMe: form.rememberMe
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#3b82f6"/>
            <path d="M15 24L21 30L33 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="title">{{ t('auth.welcomeBack') }}</h1>
        <p class="subtitle">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="authStore.error" class="error-alert">
          {{ authStore.error }}
        </div>

        <BaseInput
          v-model="form.email"
          type="email"
          :label="t('auth.email')"
          :placeholder="t('auth.emailPlaceholder')"
          :error="errors.email"
          required
        />

        <div class="password-field">
          <BaseInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :label="t('auth.password')"
            :placeholder="t('auth.passwordPlaceholder')"
            :error="errors.password"
            required
          >
            <template #suffix>
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M3 3L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </template>
          </BaseInput>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="form.rememberMe" type="checkbox" />
            <span>{{ t('auth.rememberMe') }}</span>
          </label>
          <a href="#" class="forgot-password">{{ t('auth.forgotPassword') }}</a>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="authStore.isLoading"
          full-width
        >
          {{ t('auth.signIn') }}
        </BaseButton>
      </form>

      <div class="login-footer">
        <p class="demo-hint">
          {{ t('auth.demoHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-alert {
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
}

.password-field {
  position: relative;
}

.toggle-password {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
}

.toggle-password:hover {
  color: var(--text-primary, #1f2937);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary, #4b5563);
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-password {
  color: var(--primary, #3b82f6);
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.demo-hint {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  padding: 1rem;
  background-color: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
}
</style>
