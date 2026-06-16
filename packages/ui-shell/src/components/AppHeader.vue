<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Popover from "primevue/popover";
import { useAuth } from "../composables/useAuth";
import { useLayout } from "../composables/useLayout";
import { THEME_COLORS, type ThemeColorName } from "../types";
import type { MenuItem as PrimeMenuItem } from "primevue/menuitem";

const router = useRouter();
const auth = useAuth();
const layout = useLayout();

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
    <header class="app-header border-b dark:border-surface-700 bg-white dark:bg-surface-800 px-4 py-3 flex-shrink-0">
        <div class="flex items-center justify-between">
            <!-- Left section -->
            <div class="flex items-center gap-3">
                <Button icon="pi pi-bars" text rounded @click="$emit('toggleSidebar')" aria-label="Toggle Sidebar" />
                <h1 class="text-xl font-bold text-surface-900 dark:text-surface-100">
                    <slot name="app-name" />
                </h1>
            </div>

            <!-- Right section -->
            <div class="flex items-center gap-2">
                <Button icon="pi pi-user" text rounded @click="toggleAccount" aria-label="Account" />
            </div>
        </div>

        <!-- Account Overlay -->
        <Popover ref="accountPanel">
            <Menu :model="accountMenuItems" class="border-none" />
        </Popover>
    </header>
</template>