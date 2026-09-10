<script setup lang="ts">
import { computed, inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";
import AppLogo from "../components/AppLogo.vue";
import { LogoPlacement } from "../types/eaf-logo";
import { EafActionValidationMessage } from "@eappflow/ui-shell-components";
import { useEafLayout } from "../composables/useEafLayout";
import DarkModeToggle from "../components/ui/DarkModeToggle.vue";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const layout = useEafLayout();
const currentYear = new Date().getFullYear();
</script>

<template>
  <div
    :class="[
      'min-h-screen flex flex-col text-eaf-ink',
      appConfig.classes?.layout?.unauthorized?.page?.root,
    ]"
  >
    <!-- Header with Logo -->
    <header
      :class="[
        'border-b border-surface-200 dark:border-surface-600! bg-surface-0 dark:bg-surface-900 py-6',
        appConfig.classes?.layout?.unauthorized?.header?.root,
      ]"
    >
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <h1
            :class="[
              'text-3xl font-bold',
              appConfig.classes?.layout?.unauthorized?.header?.title,
            ]"
          >
            <AppLogo
              class-image="max-h-24"
              :show-app-name="false"
              :placement="LogoPlacement.UNAUTHORIZED_LAYOUT"
            />
          </h1>
          <div class="flex justify-end items-center">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main
      :class="[
        'bg-surface-100 dark:bg-surface-950 flex-1 flex items-center justify-center px-4 py-8',
        appConfig.classes?.layout?.unauthorized?.content?.root,
      ]"
    >
      <div class="w-full max-w-md">
        <EafActionValidationMessage />
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer
      :class="[
        'border-t border-surface-200 dark:border-surface-600! bg-surface-0 dark:bg-surface-900 py-6',
        appConfig.classes?.layout?.unauthorized?.footer?.root,
      ]"
    >
      <div class="container mx-auto px-4">
        <div class="text-center">
          <p class="mb-2 text-surface-700 dark:text-surface-200">
            {{ appConfig.name }}
          </p>
          <p class="text-sm text-surface-500 dark:text-surface-400">
            &copy; {{ currentYear }} {{ appConfig.name }}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
