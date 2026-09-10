<script setup lang="ts">
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Popover from "primevue/popover";
import DarkModeToggle from "../components/ui/DarkModeToggle.vue";
import ThemeColorPicker from "../components/ui/ThemeColorPicker.vue";
import LanguageSelect from "../components/ui/LanguageSelect.vue";
import { useEafAuth } from "../composables/useEafAuth";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useScopedI18n } from "../composables/useScopedI18n";

const router = useRouter();
const auth = useEafAuth();
const { t } = useScopedI18n();

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

const emit = defineEmits<{
  toggleSidebar: [];
  logout: [];
}>();

const accountPanel = ref();

function toggleAccount(event: Event) {
  accountPanel.value?.toggle(event);
}
</script>

<template>
  <header :class="['eaf-header', appConfig.classes?.layout?.authorized?.header?.root]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-bars" class="p-0 h-8 w-8" data-testid="toggle-sidebar-button" text rounded
          aria-label="Toggle Sidebar" @click="emit('toggleSidebar')" />
        <h1 :class="[
          'eaf-header-title md:hidden',
          appConfig.classes?.layout?.authorized?.header?.title,
        ]">
          <slot name="app-name" />
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <Button icon="pi pi-user" class="p-0 h-8 w-8" data-testid="account-menu-button" text rounded
          aria-label="Account" @click="toggleAccount" />
      </div>
    </div>

    <Popover ref="accountPanel" data-testid="account-menu-panel">
      <div class="flex w-60 flex-col gap-1">
        <div class="flex items-center gap-2 px-3 py-2 text-sm font-medium">
          <span class="pi pi-user" />
          <span>{{ auth.userName || "User" }}</span>
        </div>

        <hr class="my-1 border-surface-200 dark:border-surface-700" />

        <div class="px-3 py-1">
          <DarkModeToggle withLabel class="w-full" />
        </div>

        <ThemeColorPicker class="px-3 py-2" />

        <LanguageSelect withLabel class="px-3 py-2" />

        <hr class="my-1 border-surface-200 dark:border-surface-700" />

        <button type="button" class="flex items-center gap-2 px-3 py-2 text-sm text-left rounded cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800" @click="router.push('/change-password')">
          <span class="pi pi-key" />
          <span>{{ t("change_password", "Change Password", "Zmień hasło") }}</span>
        </button>
        <button type="button" data-testid="logout-menu-item" class="flex items-center gap-2 px-3 py-2 text-sm text-left rounded cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800" @click="emit('logout')">
          <span class="pi pi-sign-out" />
          <span>{{ t("logout", "Logout", "Wyloguj") }}</span>
        </button>
      </div>
    </Popover>
  </header>
</template>

<style>
@layer eaf-shell {
  .eaf-header {
    flex-shrink: 0;
    padding: 0.75rem 1rem;
    background-color: var(--p-content-background);
    border-bottom: 1px solid var(--p-content-border-color);
    max-height: 56px;
  }

  .eaf-header-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--p-text-color);
  }
}
</style>
