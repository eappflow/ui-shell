<script setup lang="ts">
import { useAuthStore } from "@eappflow/ui-shell";

const auth = useAuthStore();
</script>

<template>
  <div class="space-y-6" data-testid="dashboard-page">
    <!-- Welcome -->
    <div>
      <h1
        class="text-3xl font-bold text-surface-900 dark:text-surface-100"
        data-testid="dashboard-welcome-heading"
      >
        Welcome, {{ auth.userName || "User" }}
      </h1>
      <p class="text-surface-600 dark:text-surface-400 mt-2">
        This is the demo application for the eAppFlow UI Shell.
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-surface-500">Users</h3>
        <p
          class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100"
        >
          1,234
        </p>
      </div>
      <div
        class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-surface-500">Revenue</h3>
        <p
          class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100"
        >
          $45,678
        </p>
      </div>
      <div
        class="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-surface-500">Orders</h3>
        <p
          class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100"
        >
          567
        </p>
      </div>
    </div>
  </div>
</template>
