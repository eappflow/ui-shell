<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Drawer from 'primevue/drawer'
import Popover from 'primevue/popover'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useEafAuth } from '../composables/useEafAuth'
import { useEafLayout } from '../composables/useEafLayout'
import { APP_CONFIG_KEY } from '../services/interfaces'
import type { MenuItem as PrimeMenuItem } from 'primevue/menuitem'
import { THEME_COLORS, type ThemeColorName } from '../types'
import AppMainMenu from '../components/AppMainMenu.vue'

const router = useRouter()
const auth = useEafAuth()
const layout = useEafLayout()
const appConfig = inject(APP_CONFIG_KEY, { name: 'App', version: '0.0.0' })

// Sidebar state
const sidebarVisible = ref(true)
const mobileSidebarVisible = ref(false)

// Refs for overlay panels
const settingsPanel = ref()
const accountPanel = ref()

// Computed
const currentYear = new Date().getFullYear()

// Settings menu items
const themeColors = computed<PrimeMenuItem[]>(() =>
  Object.keys(THEME_COLORS).map((color) => ({
    label: color.charAt(0).toUpperCase() + color.slice(1),
    icon: 'pi pi-circle-fill',
    style: { color: THEME_COLORS[color as ThemeColorName] },
    command: () => layout.setPrimaryColor(color as ThemeColorName),
  }))
)

const settingsMenuItems = computed<PrimeMenuItem[]>(() => [
  {
    label: 'Dark Mode',
    icon: layout.darkMode ? 'pi pi-moon' : 'pi pi-sun',
    command: () => layout.toggleDarkMode(),
  },
  {
    separator: true,
  },
  {
    label: 'Theme Color',
    icon: 'pi pi-palette',
    items: themeColors.value,
  },
])

const accountMenuItems = computed<PrimeMenuItem[]>(() => [
  {
    label: auth.userName || 'User',
    icon: 'pi pi-user',
    disabled: true,
  },
  {
    separator: true,
  },
  {
    label: 'Change Password',
    icon: 'pi pi-key',
    command: () => router.push('/change-password'),
  },
  {
    separator: true,
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => handleLogout(),
  },
])

// Methods
function toggleSidebar(): void {
  sidebarVisible.value = !sidebarVisible.value
}

function toggleMobileSidebar(): void {
  mobileSidebarVisible.value = !mobileSidebarVisible.value
}

function toggleSettings(event: Event): void {
  settingsPanel.value?.toggle(event)
}

function toggleAccount(event: Event): void {
  accountPanel.value?.toggle(event)
}

function handleMenuItemClick(): void {
  mobileSidebarVisible.value = false
}

async function handleLogout(): Promise<void> {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-page-background min-h-screen flex">
    <!-- Global Toast and Confirm Dialog -->
    <Toast />
    <ConfirmDialog />

    <!-- Desktop Sidebar -->
    <aside v-if="sidebarVisible" class="app-sidebar hidden md:flex md:flex-col w-64 border-r transition-all duration-300">
      <!-- Sidebar Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <AppMainMenu />
      </div>
    </aside>

    <!-- Mobile Sidebar -->
    <Drawer v-model:visible="mobileSidebarVisible" class="md:hidden">
      <template #header>
        <h2 class="text-xl font-bold">{{ appConfig.name }}</h2>
      </template>

      <AppMainMenu @item-click="handleMenuItemClick" />
    </Drawer>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="app-header border-b px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Left: Menu Toggle + App Name -->
          <div class="flex items-center gap-3">
            <!-- Desktop Toggle -->
            <div class="hidden md:inline-flex">
              <Button icon="pi pi-bars" text rounded @click="toggleSidebar" aria-label="Toggle Sidebar" />
            </div>

            <!-- Mobile Toggle -->
            <div class="inline-flex md:hidden">
              <Button icon="pi pi-bars" text rounded @click="toggleMobileSidebar" aria-label="Toggle Menu" />
            </div>
            <h1 class="text-xl font-bold text-surface-900 dark:text-surface-100">
              {{ appConfig.name }}
            </h1>
          </div>

          <!-- Right: Settings + Account -->
          <div class="flex items-center gap-2">
            <!-- Settings Button -->
            <!-- <Button icon="pi pi-cog" text rounded @click="toggleSettings" aria-label="Settings" /> -->

            <!-- Account Button -->
            <Button icon="pi pi-user" text rounded @click="toggleAccount" aria-label="Account" />
          </div>
        </div>
      </header>

      <!-- Settings Overlay -->
      <Popover ref="settingsPanel">
        <Menu :model="settingsMenuItems" class="border-none" />
      </Popover>

      <!-- Account Overlay -->
      <Popover ref="accountPanel">
        <Menu :model="accountMenuItems" class="border-none" />
      </Popover>

      <!-- Page Content -->
      <main class="app-content flex-1 overflow-y-auto p-1 md:p-2">
        <router-view class="flex gap-2 flex-col" />
      </main>

      <!-- Footer -->
      <footer class="app-footer border-t px-4 py-3">
        <div class="flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          <p>&copy; {{ currentYear }} {{ appConfig.name }}. All rights reserved.</p>
          <p>Version {{ appConfig.version }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed, but prefer Tailwind utilities */
</style>
