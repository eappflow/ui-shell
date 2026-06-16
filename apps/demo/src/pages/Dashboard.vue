<script setup lang="ts">
import { ref } from "vue";
import { EafButton, EafModal } from "@eappflow/ui-shell-components";
import { useAuth } from "@eappflow/ui-shell";

const auth = useAuth();
const showModal = ref(false);
</script>

<template>
    <div class="space-y-6">
        <!-- Welcome -->
        <div>
            <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-100">
                Welcome, {{ auth.userName || "User" }}
            </h1>
            <p class="text-surface-600 dark:text-surface-400 mt-2">
                This is the demo application for the eAppFlow UI Shell.
            </p>
        </div>

        <!-- Stats cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm">
                <h3 class="text-sm font-medium text-surface-500">Users</h3>
                <p class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">1,234</p>
            </div>
            <div class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm">
                <h3 class="text-sm font-medium text-surface-500">Revenue</h3>
                <p class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">$45,678</p>
            </div>
            <div class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm">
                <h3 class="text-sm font-medium text-surface-500">Orders</h3>
                <p class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">567</p>
            </div>
        </div>

        <!-- Component demos -->
        <div class="flex gap-2">
            <EafButton variant="primary" @click="showModal = true">Open Modal</EafButton>
            <EafButton variant="secondary">Secondary</EafButton>
            <EafButton variant="danger">Delete</EafButton>
        </div>

        <EafModal :visible="showModal" @close="showModal = false">
            <template #header>Demo Modal</template>
            <p>This is a modal dialog rendered via the ui-shell-components package.</p>
            <template #footer>
                <EafButton variant="secondary" @click="showModal = false">Close</EafButton>
            </template>
        </EafModal>
    </div>
</template>