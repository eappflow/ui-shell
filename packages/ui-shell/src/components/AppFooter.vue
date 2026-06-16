<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
    <footer class="app-footer flex items-center justify-between border-t border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-6 py-3 text-xs text-surface-600 dark:text-surface-400 flex-shrink-0">
        <span>&copy; {{ year }}
            <slot name="app-name" />. All rights reserved.
        </span>
        <slot name="right" />
    </footer>
</template>