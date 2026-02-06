<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const menuItems = computed(() => [
  { id: 'dashboard', label: t('menu.dashboard'), icon: 'dashboard', route: '/dashboard' },
  { id: 'orders', label: t('menu.orders'), icon: 'orders', route: '/orders' },
  { id: 'customers', label: t('menu.customers'), icon: 'customers', route: '/customers' },
  { id: 'settings', label: t('menu.settings'), icon: 'settings', route: '/settings' }
])

const currentLanguage = computed(() => locale.value === 'en' ? 'EN' : 'TR')

function toggleSidebar(): void {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function toggleMobileMenu(): void {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

function toggleLanguage(): void {
  locale.value = locale.value === 'en' ? 'tr' : 'en'
}

async function handleLogout(): Promise<void> {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="menu-toggle" @click="toggleMobileMenu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="logo">AdminPanel</div>
      <div class="header-actions">
        <button class="lang-toggle" @click="toggleLanguage">{{ currentLanguage }}</button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3b82f6"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span v-if="!isSidebarCollapsed" class="logo-text">AdminPanel</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path v-if="isSidebarCollapsed" d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-else d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.id"
          :to="item.route"
          class="nav-item"
          :class="{ active: isActive(item.route) }"
          @click="isMobileMenuOpen = false"
        >
          <span class="nav-icon">
            <!-- Dashboard icon -->
            <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <!-- Orders icon -->
            <svg v-else-if="item.icon === 'orders'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <!-- Customers icon -->
            <svg v-else-if="item.icon === 'customers'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="6" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 18C3 14.134 6.134 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <!-- Settings icon -->
            <svg v-else-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.657 4.343L14.243 5.757M5.757 14.243L4.343 15.657M15.657 15.657L14.243 14.243M5.757 5.757L4.343 4.343" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span v-if="!isSidebarCollapsed" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userFullName" />
            <span v-else>{{ authStore.user?.firstName?.[0] || 'U' }}</span>
          </div>
          <div v-if="!isSidebarCollapsed" class="user-details">
            <span class="user-name">{{ authStore.userFullName }}</span>
            <span class="user-role">{{ authStore.userRole }}</span>
          </div>
        </div>
        <button v-if="!isSidebarCollapsed" class="logout-btn" @click="handleLogout">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7M13 14L17 10M17 10L13 6M17 10H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Main Content -->
    <main class="main-content">
      <header class="content-header">
        <div class="header-left">
          <slot name="header-left"></slot>
        </div>
        <div class="header-right">
          <button class="lang-toggle desktop-only" @click="toggleLanguage">
            {{ currentLanguage }}
          </button>
          <div class="user-menu desktop-only">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userFullName" class="user-avatar-sm" />
            <span class="user-name-sm">{{ authStore.userFullName }}</span>
          </div>
        </div>
      </header>

      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary, #f9fafb);
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-primary, #1f2937);
  cursor: pointer;
  border-radius: 8px;
}

.menu-toggle:hover {
  background-color: var(--hover-bg, #f3f4f6);
}

/* Sidebar */
.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: white;
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  z-index: 200;
}

.sidebar-collapsed .sidebar {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary, #1f2937);
}

.logo-icon {
  flex-shrink: 0;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  background-color: var(--hover-bg, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

/* Collapsed sidebar - center the expand button */
.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem 0.5rem;
}

.sidebar-collapsed .collapse-btn {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.sidebar-collapsed .collapse-btn:hover {
  background: var(--hover-bg, #f3f4f6);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background-color: var(--hover-bg, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.nav-item.active {
  background-color: var(--primary-light, #eff6ff);
  color: var(--primary, #3b82f6);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
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
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  text-transform: capitalize;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

.sidebar-collapsed .user-info {
  justify-content: center;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.2s ease;
}

.sidebar-collapsed .main-content {
  margin-left: 72px;
}

.content-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-toggle {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  background: white;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lang-toggle:hover {
  background-color: var(--hover-bg, #f3f4f6);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name-sm {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.content-body {
  flex: 1;
  padding: 1.5rem;
}

/* Mobile styles */
@media (max-width: 1024px) {
  .mobile-header {
    display: flex;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
  }

  .main-content {
    margin-left: 0;
    padding-top: 56px;
  }

  .sidebar-collapsed .main-content {
    margin-left: 0;
  }

  .desktop-only {
    display: none !important;
  }

  .content-header {
    display: none;
  }

  .content-body {
    padding: 1rem;
  }
}
</style>
