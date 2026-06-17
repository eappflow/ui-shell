<script setup lang="ts">
import Card from "primevue/card";

</script>

<template>
    <div class="space-y-6">
        <Card>
            <template #title>
                <div class="flex items-center gap-3">
                    <i class="pi pi-home text-4xl text-primary"></i>
                    <span class="text-2xl font-semibold">Welcome to eAppFlow</span>
                </div>
            </template>
            <template #content>
                <p class="text-lg text-muted-color mb-3 bg-red-500">
                    <strong>eAppFlow</strong> is a powerful management platform for enterprise Solutions.
                </p>
                <p class="text-muted-color">
                    Built on the <strong>UI-Shell</strong> framework — a modular, role-based component library
                    powered by Vue 3, PrimeVue, and TailwindCSS. UI-Shell delivers a consistent, responsive
                    experience with dynamic menus, permission-based access control, and theming support
                    across all modules.
                </p>
            </template>
        </Card>
    </div>
</template>