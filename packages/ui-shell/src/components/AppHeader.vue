<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Popover from "primevue/popover";
import { useEafAuth } from "../composables/useEafAuth";
import { useEafLayout } from "../composables/useEafLayout";
import { THEME_COLORS, type ThemeColorName } from "../types";
import type { MenuItem as PrimeMenuItem } from "primevue/menuitem";
import { APP_CONFIG_KEY, I18n_CONFIG_KEY } from "../services/interfaces";
import { useScopedI18n } from "../composables/useScopedI18n";

const router = useRouter();
const auth = useEafAuth();
const layout = useEafLayout();
const { t } = useScopedI18n();
const { locale } = useI18n({ useScope: "global" });
const i18nConfig = inject(I18n_CONFIG_KEY);

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

const emit = defineEmits<{
  toggleSidebar: [];
  logout: [];
}>();

const accountPanel = ref();

const themeColors = computed<PrimeMenuItem[]>(() =>
  Object.keys(THEME_COLORS).map((color) => ({
    label: color.charAt(0).toUpperCase() + color.slice(1),
    icon: "pi pi-circle-fill",
    style: { color: THEME_COLORS[color as ThemeColorName] },
    command: () => layout.setPrimaryColor(color as ThemeColorName),
  })),
);

const accountMenuItems = computed<PrimeMenuItem[]>(() => [
  {
    label: auth.userName || "User",
    icon: "pi pi-user",
    disabled: true,
  },
  {
    separator: true,
  },
  {
    label: t("dark_mode", "Dark Mode", "Tryb ciemny"),
    icon: layout.darkMode ? "pi pi-moon" : "pi pi-sun",
    command: () => layout.toggleDarkMode(),
  },
  {
    label: t("theme_color", "Theme Color", "Kolor motywu"),
    icon: "pi pi-palette",
    items: themeColors.value,
  },
  {
    separator: true,
  },
  {
    label: t("language", "Language", "Język"),
    icon: "pi pi-language",
    items: i18nConfig?.supportedLanguages
      ? i18nConfig?.supportedLanguages.map(
          ({ localeCode, displayNameKey }) => ({
            label: t(displayNameKey, displayNameKey, displayNameKey),
            icon: locale.value === localeCode ? "pi pi-check" : undefined,
            command: () => (locale.value = localeCode),
          }),
        )
      : [],
  },
  {
    label: t("change_password", "Change Password", "Zmień hasło"),
    icon: "pi pi-key",
    command: () => router.push("/change-password"),
  },
  {
    separator: true,
  },
  {
    label: t("logout", "Logout", "Wyloguj"),
    icon: "pi pi-sign-out",
    testId: "logout-menu-item",
    command: () => emit("logout"),
  },
]);

function toggleAccount(event: Event) {
  accountPanel.value?.toggle(event);
}
</script>

<template>
  <header
    :class="['eaf-header', appConfig.classes?.layout?.authorized?.header?.root]"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-bars"
          class="p-0 h-8 w-8"
          data-testid="toggle-sidebar-button"
          text
          rounded
          aria-label="Toggle Sidebar"
          @click="emit('toggleSidebar')"
        />
        <h1
          :class="[
            'eaf-header-title md:hidden',
            appConfig.classes?.layout?.authorized?.header?.title,
          ]"
        >
          <slot name="app-name" />
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-user"
          class="p-0 h-8 w-8"
          data-testid="account-menu-button"
          text
          rounded
          aria-label="Account"
          @click="toggleAccount"
        />
      </div>
    </div>

    <Popover ref="accountPanel" data-testid="account-menu-panel">
      <Menu
        :model="accountMenuItems"
        class="border-none"
        :pt="{
          item: ({ context }: { context: { item: PrimeMenuItem } }) =>
            context.item.testId
              ? { 'data-testid': context.item.testId }
              : {},
        }"
      />
    </Popover>
  </header>
</template>

<style>
@layer eaf-shell {
  .eaf-header {
    flex-shrink: 0;
    padding: 0.75rem 1rem;
    background-color: var(--p-surface-0);
    border-bottom: 1px solid var(--p-surface-200);
    max-height: 56px;
  }

  .eaf-header-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--p-surface-900);
  }
}
</style>
