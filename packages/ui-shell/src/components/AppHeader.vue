<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Popover from "primevue/popover";
import { useEafAuth } from "../composables/useEafAuth";
import { useEafLayout } from "../composables/useEafLayout";
import {
  THEME_COLORS,
  type ThemeColorName,
  type HeaderClasses,
} from "../types";
import type { MenuItem as PrimeMenuItem } from "primevue/menuitem";

const router = useRouter();
const auth = useEafAuth();
const layout = useEafLayout();

const props = defineProps<{
  classes?: HeaderClasses;
}>();

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
    label: "Dark Mode",
    icon: layout.darkMode ? "pi pi-moon" : "pi pi-sun",
    command: () => layout.toggleDarkMode(),
  },
  {
    label: "Theme Color",
    icon: "pi pi-palette",
    items: themeColors.value,
  },
  {
    separator: true,
  },
  {
    label: "Change Password",
    icon: "pi pi-key",
    command: () => router.push("/change-password"),
  },
  {
    separator: true,
  },
  {
    label: "Logout",
    icon: "pi pi-sign-out",
    command: () => emit("logout"),
  },
]);

function toggleAccount(event: Event) {
  accountPanel.value?.toggle(event);
}
</script>

<template>
  <header :class="['eaf-header', classes?.root]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-bars"
          class="p-0 h-8 w-8"
          text
          rounded
          aria-label="Toggle Sidebar"
          @click="emit('toggleSidebar')"
        />
        <h1 :class="['eaf-header-title md:hidden', classes?.title]">
          <slot name="app-name" />
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-user"
          class="p-0 h-8 w-8"
          text
          rounded
          aria-label="Account"
          @click="toggleAccount"
        />
      </div>
    </div>

    <Popover ref="accountPanel">
      <Menu :model="accountMenuItems" class="border-none" />
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
