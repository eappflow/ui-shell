<script setup lang="ts">
import type { User } from "../types";

defineProps<{
    user: User | null;
    sidebarCollapsed: boolean;
}>();

defineEmits<{
    toggleSidebar: [];
    logout: [];
}>();
</script>

<template>
    <header class="app-header flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div class="flex items-center gap-3">
            <button class="rounded-md p-1 text-slate-500 hover:bg-slate-100 focus:outline-none lg:hidden" @click="$emit('toggleSidebar')">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <slot name="breadcrumbs" />
        </div>
        <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">
                {{ user?.name ?? "Guest" }}
            </span>
            <button class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100" @click="$emit('logout')">
                Logout
            </button>
        </div>
    </header>
</template>