<script setup lang="ts">
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";
import { useAuth } from "../composables/useAuth";
import { useNavigation } from "../composables/useNavigation";
import { useLayout } from "../composables/useLayout";

const auth = useAuth();
const navigation = useNavigation();
const layout = useLayout();
</script>

<template>
    <div class="app-layout flex h-screen bg-slate-50">
        <AppSidebar :items="navigation.items" :collapsed="layout.sidebarCollapsed" @toggle="layout.toggleSidebar()" />
        <div class="app-layout-main flex flex-1 flex-col overflow-hidden">
            <AppHeader :user="auth.user" :sidebar-collapsed="layout.sidebarCollapsed" @toggle-sidebar="layout.toggleSidebar()" @logout="auth.logout" />
            <main class="app-layout-content flex-1 overflow-y-auto p-6">
                <slot />
            </main>
            <AppFooter />
        </div>
    </div>
</template>