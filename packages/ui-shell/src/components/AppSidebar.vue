<script setup lang="ts">
import Button from "primevue/button";

defineProps<{
    visible: boolean;
}>();

defineEmits<{
    toggle: [];
}>();
</script>

<template>
    <aside v-if="visible" class="app-sidebar hidden md:flex md:flex-col w-64 border-r dark:border-surface-700 transition-all duration-300 bg-white dark:bg-surface-800 flex-shrink-0">
        <div class="flex items-center justify-between h-14 px-4 border-b dark:border-surface-700 flex-shrink-0">
            <span class="text-lg font-bold tracking-wide text-surface-900 dark:text-surface-100">
                <slot name="logo" />
            </span>
            <Button icon="pi pi-times" text rounded severity="secondary" size="small" @click="$emit('toggle')" aria-label="Close Sidebar" />
        </div>
        <div class="flex-1 overflow-y-auto p-4">
            <slot />
        </div>
    </aside>
</template>