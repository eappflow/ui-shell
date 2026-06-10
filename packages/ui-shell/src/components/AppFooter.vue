<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
    <footer class="app-footer flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
        <span>&copy; {{ year }} eAppFlow. All rights reserved.</span>
        <slot name="right" />
    </footer>
</template>