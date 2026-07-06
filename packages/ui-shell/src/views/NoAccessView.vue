<script setup lang="ts">
import { useRouter } from "vue-router";
import Card from "primevue/card";
import Button from "primevue/button";

const router = useRouter();
</script>

<template>
  <div class="max-w-lg mx-auto mt-12">
    <Card>
      <template #content>
        <div class="text-center p-8">
          <i class="pi pi-lock text-5xl text-red-400 mb-4 block"></i>
          <h2
            class="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2"
          >
            Access Denied
          </h2>
          <p class="text-surface-600 dark:text-surface-400 mb-6">
            You don't have permission to access this page.
          </p>
          <Button label="Go to Dashboard" @click="router.push('/')" />
        </div>
      </template>
    </Card>
  </div>
</template>
