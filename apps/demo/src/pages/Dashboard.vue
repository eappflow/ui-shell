<script setup lang="ts">
import { useAuthStore } from "@eappflow/ui-shell";
import Card from "primevue/card";

const auth = useAuthStore();

const stats = [
  { label: "Users", value: "1,234" },
  { label: "Revenue", value: "$45,678" },
  { label: "Orders", value: "567" },
];
</script>

<template>
  <div
    class="space-y-6"
    data-testid="dashboard-page"
  >
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
      <Card
        v-for="stat in stats"
        :key="stat.label"
      >
        <template #title>
          {{ stat.label }}
        </template>
        <template #content>
          <p class="text-2xl font-bold">
            {{ stat.value }}
          </p>
        </template>
      </Card>
    </div>
  </div>
</template>
