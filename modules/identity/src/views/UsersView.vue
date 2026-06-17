<script setup lang="ts">
import Card from "primevue/card";
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-100">Users</h1>
        <p class="text-surface-600 dark:text-surface-400 mt-2">User management</p>

        <Card class="mt-6">
            <template #content>
                <div class="p-8 text-center text-surface-500">
                    <i class="pi pi-users text-4xl mb-4 block"></i>
                    <p class="text-lg">User management is available in the full application.</p>
                    <p class="mt-2">This view is provided by the Identity module.</p>
                </div>
            </template>
        </Card>
    </div>
</template>