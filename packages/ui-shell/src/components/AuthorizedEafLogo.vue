<script setup lang="ts">
import { inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";

defineProps<{
  showAppName: boolean;
}>();

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
</script>

<template>
  <div class="flex items-center gap-2.5">
    <component
      :is="appConfig.authorized?.logo"
      v-if="appConfig.authorized?.logo"
    />
    <span
      v-if="showAppName"
      class="text-base text-eaf-ink font-bold tracking-wide truncate"
    >
      {{ appConfig.name }}
    </span>
  </div>
</template>
