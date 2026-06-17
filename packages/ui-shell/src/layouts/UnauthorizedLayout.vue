<script setup lang="ts">
import { inject } from 'vue'
import { APP_CONFIG_KEY } from '../services/interfaces'

const appConfig = inject(APP_CONFIG_KEY, { name: 'App', version: '0.0.0' })
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="app-page-background min-h-screen flex flex-col">
    <!-- Header with Logo -->
    <header class="app-header border-b py-6">
      <div class="container mx-auto px-4">
        <div class="flex justify-center">
          <h1 class="text-3xl font-bold text-primary">
            {{ appConfig.name }}
          </h1>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="app-content flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer border-t py-6">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <p class="mb-2">{{ appConfig.name }}</p>
          <p class="text-sm">
            &copy; {{ currentYear }} {{ appConfig.name }}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Additional styles if needed, but prefer Tailwind utilities */
</style>
