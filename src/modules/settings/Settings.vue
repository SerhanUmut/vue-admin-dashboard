<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { PageHeader, BaseButton, BaseInput, BaseSelect } from '@/components/common'
import type { SelectOption } from '@/types'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const activeTab = ref('profile')

const profileForm = reactive({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || '',
  phone: ''
})

const preferences = reactive({
  language: locale.value,
  theme: 'light',
  emailNotifications: true,
  pushNotifications: false
})

const tabs = [
  { id: 'profile', label: t('settings.profile') },
  { id: 'preferences', label: t('settings.preferences') },
  { id: 'security', label: t('settings.security') },
  { id: 'notifications', label: t('settings.notifications') }
]

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' }
]

const themeOptions: SelectOption[] = [
  { value: 'light', label: t('settings.themeLight') },
  { value: 'dark', label: t('settings.themeDark') },
  { value: 'system', label: t('settings.themeSystem') }
]

const breadcrumbs = [
  { label: t('menu.dashboard'), route: '/dashboard' },
  { label: t('menu.settings') }
]

function handleLanguageChange(value: string | number | null): void {
  if (value && typeof value === 'string') {
    locale.value = value
    preferences.language = value
  }
}

function saveProfile(): void {
  // Simulated save
  console.log('Profile saved:', profileForm)
}

function savePreferences(): void {
  // Simulated save
  console.log('Preferences saved:', preferences)
}
</script>

<template>
  <div class="settings-page">
    <PageHeader
      :title="t('settings.title')"
      :subtitle="t('settings.subtitle')"
      :breadcrumbs="breadcrumbs"
    />

    <div class="settings-layout">
      <!-- Tabs Navigation -->
      <nav class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- Tab Content -->
      <div class="settings-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ t('settings.profileInfo') }}</h2>
            <p class="panel-description">{{ t('settings.profileDescription') }}</p>
          </div>

          <form class="settings-form" @submit.prevent="saveProfile">
            <div class="avatar-section">
              <div class="current-avatar">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userFullName" />
                <span v-else>{{ authStore.user?.firstName?.[0] || 'U' }}</span>
              </div>
              <div class="avatar-actions">
                <BaseButton variant="outline" size="sm">{{ t('settings.changeAvatar') }}</BaseButton>
                <BaseButton variant="ghost" size="sm">{{ t('settings.removeAvatar') }}</BaseButton>
              </div>
            </div>

            <div class="form-grid">
              <BaseInput
                v-model="profileForm.firstName"
                :label="t('settings.firstName')"
                required
              />
              <BaseInput
                v-model="profileForm.lastName"
                :label="t('settings.lastName')"
                required
              />
              <BaseInput
                v-model="profileForm.email"
                type="email"
                :label="t('settings.email')"
                required
              />
              <BaseInput
                v-model="profileForm.phone"
                type="tel"
                :label="t('settings.phone')"
              />
            </div>

            <div class="form-actions">
              <BaseButton type="submit" variant="primary">{{ t('settings.saveChanges') }}</BaseButton>
            </div>
          </form>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'" class="tab-panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ t('settings.preferences') }}</h2>
            <p class="panel-description">{{ t('settings.preferencesDescription') }}</p>
          </div>

          <form class="settings-form" @submit.prevent="savePreferences">
            <div class="form-grid">
              <BaseSelect
                :model-value="preferences.language"
                :options="languageOptions"
                :label="t('settings.language')"
                @update:model-value="handleLanguageChange"
              />
              <BaseSelect
                v-model="preferences.theme"
                :options="themeOptions"
                :label="t('settings.theme')"
              />
            </div>

            <div class="form-actions">
              <BaseButton type="submit" variant="primary">{{ t('settings.saveChanges') }}</BaseButton>
            </div>
          </form>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="tab-panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ t('settings.security') }}</h2>
            <p class="panel-description">{{ t('settings.securityDescription') }}</p>
          </div>

          <div class="security-section">
            <div class="security-item">
              <div class="security-info">
                <h3>{{ t('settings.changePassword') }}</h3>
                <p>{{ t('settings.changePasswordDescription') }}</p>
              </div>
              <BaseButton variant="outline">{{ t('settings.changePassword') }}</BaseButton>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h3>{{ t('settings.twoFactorAuth') }}</h3>
                <p>{{ t('settings.twoFactorDescription') }}</p>
              </div>
              <BaseButton variant="outline">{{ t('settings.enable') }}</BaseButton>
            </div>

            <div class="security-item danger">
              <div class="security-info">
                <h3>{{ t('settings.deleteAccount') }}</h3>
                <p>{{ t('settings.deleteAccountDescription') }}</p>
              </div>
              <BaseButton variant="danger">{{ t('settings.deleteAccount') }}</BaseButton>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="tab-panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ t('settings.notifications') }}</h2>
            <p class="panel-description">{{ t('settings.notificationsDescription') }}</p>
          </div>

          <div class="notification-settings">
            <label class="toggle-option">
              <div class="toggle-info">
                <span class="toggle-label">{{ t('settings.emailNotifications') }}</span>
                <span class="toggle-description">{{ t('settings.emailNotificationsDescription') }}</span>
              </div>
              <input v-model="preferences.emailNotifications" type="checkbox" class="toggle-input" />
            </label>

            <label class="toggle-option">
              <div class="toggle-info">
                <span class="toggle-label">{{ t('settings.pushNotifications') }}</span>
                <span class="toggle-description">{{ t('settings.pushNotificationsDescription') }}</span>
              </div>
              <input v-model="preferences.pushNotifications" type="checkbox" class="toggle-input" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 1000px;
}

.settings-layout {
  display: flex;
  gap: 2rem;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb);
}

@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
  }
}

.settings-nav {
  width: 220px;
  flex-shrink: 0;
  padding: 1.5rem;
  background: var(--bg-secondary, #f9fafb);
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .settings-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }
}

.nav-tab {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.9375rem;
  color: var(--text-secondary, #6b7280);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-tab:hover {
  background: white;
  color: var(--text-primary, #1f2937);
}

.nav-tab.active {
  background: white;
  color: var(--primary, #3b82f6);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-content {
  flex: 1;
  padding: 1.5rem;
  min-width: 0;
}

.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.25rem 0;
}

.panel-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.current-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  overflow: hidden;
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.security-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  gap: 1rem;
}

.security-item.danger {
  background: #fef2f2;
}

.security-info h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.25rem 0;
}

.security-info p {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  cursor: pointer;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.toggle-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.toggle-description {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.toggle-input {
  width: 44px;
  height: 24px;
  cursor: pointer;
}
</style>
