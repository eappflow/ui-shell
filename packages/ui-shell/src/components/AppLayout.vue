<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";
import AppMainMenu from "./AppMainMenu.vue";
import { useEafAuth } from "../composables/useEafAuth.js";
import { useEafNavigation } from "../composables/useEafNavigation";
import { useEafLayout } from "../composables/useEafLayout.js";
import { useAuthStore } from "../stores/useAuthStore";
import { useEafMessageStore, EafActionValidationMessage } from "@eappflow/ui-shell-components";
import { useToast } from "primevue/usetoast";
import { watch } from "vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";

const router = useRouter();
const auth = useEafAuth();
const navigation = useEafNavigation();
const layout = useEafLayout();
const authStore = useAuthStore();
const messageStore = useEafMessageStore();
const toast = useToast();

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

async function handleLogout() {
    await auth.logout();
    router.push("/login");
}
</script>

<template>
    <div class="app-layout flex h-screen bg-surface-50 dark:bg-surface-900">
        <!-- Global Toast and Confirm Dialog -->
        <Toast />
        <ConfirmDialog />

        <!-- Sidebar -->
        <AppSidebar :visible="true">
            <AppMainMenu />
        </AppSidebar>

        <!-- Main Content Area -->
        <div class="app-layout-main flex flex-1 flex-col overflow-hidden min-w-0">
            <!-- Header -->
            <AppHeader @logout="handleLogout" />

            <!-- Page Content -->
            <main class="app-layout-content flex-1 overflow-y-auto p-1 md:p-2">
                <!-- Global Action Validation Message -->
                <div class="w-full max-w-4xl mx-auto px-1 md:px-4 mb-2">
                    <EafActionValidationMessage />
                </div>
                <slot />
            </main>

            <!-- Footer -->
            <AppFooter />
        </div>
    </div>
</template>