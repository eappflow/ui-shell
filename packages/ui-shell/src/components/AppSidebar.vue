<script setup lang="ts">
import type { NavigationItem } from "../types";

defineProps<{
    items: NavigationItem[];
    collapsed: boolean;
}>();

defineEmits<{
    toggle: [];
}>();
</script>

<template>
    <aside class="app-sidebar flex flex-col bg-slate-900 text-white transition-all duration-300" :class="collapsed ? 'w-16' : 'w-64'">
        <div class="app-sidebar-header flex h-14 items-center justify-between px-4">
            <span v-if="!collapsed" class="text-lg font-bold tracking-wide">
                eAppFlow
            </span>
            <button class="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none" @click="$emit('toggle')">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'" />
                </svg>
            </button>
        </div>
        <nav class="app-sidebar-nav flex-1 space-y-1 px-2 py-4">
            <router-link v-for="item in items" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-700"
                :class="collapsed ? 'justify-center' : ''">
                <span v-if="item.icon" class="h-5 w-5">{{ item.icon }}</span>
                <span v-if="!collapsed">{{ item.label }}</span>
            </router-link>
        </nav>
    </aside>
</template>