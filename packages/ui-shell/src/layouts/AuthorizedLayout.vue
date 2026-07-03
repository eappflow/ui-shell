<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
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
import AppFooter from "../components/AppFooter.vue";
import AppLogo from "../components/AppLogo.vue";
import AppHeader from "../components/AppHeader.vue";
import AppSidebar from "../components/AppSidebar.vue";
import { useEafMessageStore, EafActionValidationMessage } from "@eappflow/ui-shell-components";
import { useToast } from "primevue/usetoast";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter()
const auth = useEafAuth()
const layout = useEafLayout()
const appConfig = inject(APP_CONFIG_KEY, { name: 'App', version: '0.0.0' })
const messageStore = useEafMessageStore();
const toast = useToast();

// Sidebar state
const sidebarVisible = ref(true)
const mobileSidebarVisible = ref(false)

// Refs for overlay panels
const settingsPanel = ref()
const accountPanel = ref()

// Subscribe to message store and display toasts
watch(
    () => messageStore.messages.length,
    () => {
      if (messageStore.messages.length > 0) {
        const message = messageStore.messages[0];
        if (message) {
          toast.add(message);
        }
        messageStore.clearMessages();
      }
    },
);

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
    <AppSidebar
        :visible="sidebarVisible"
        @toggle="toggleSidebar"
        :classes="appConfig.classes?.layout?.sidebar"
    >
      <!-- Logo Area -->
      <template #logo>
        <AppLogo
            :appName="appConfig.name"
            :logoSrc="appConfig.logoSrc"
        />
      </template>

      <!-- Sidebar Content -->
      <AppMainMenu :classes="appConfig.classes?.layout?.menu" />
    </AppSidebar>

    <!-- Mobile Sidebar -->
    <Drawer v-model:visible="mobileSidebarVisible" class="md:hidden">
      <template #header>
        <AppLogo :appName="appConfig.name" :logo="appConfig.logoSrc"/>
      </template>

      <AppMainMenu
          :classes="appConfig.classes?.layout?.menu"
          @item-click="handleMenuItemClick"
      />
    </Drawer>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <AppHeader
          :classes="appConfig.classes?.layout?.header"
          @toggleSidebar="toggleSidebar"
          @logout="handleLogout"
      >
        <template #app-name>
          {{ appConfig.name }}
        </template>
      </AppHeader>

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
        <!-- Global Action Validation Message -->
        <div class="w-full max-w-4xl mx-auto px-1 md:px-4 mb-2">
          <EafActionValidationMessage />
        </div>
        <router-view class="flex gap-2 flex-col" />
      </main>

      <!-- Footer -->
      <AppFooter :classes="appConfig.classes?.layout?.footer">
        <template #app-name>{{ appConfig.name }}</template>
        <template #right>
          <p>Version {{ appConfig.version }}</p>
        </template>
      </AppFooter>
    </div>
  </div>
</template>
