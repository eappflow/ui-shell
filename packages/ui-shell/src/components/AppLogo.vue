<script setup lang="ts">
import {inject} from "vue";
import {APP_CONFIG_KEY} from "../services/interfaces";

defineProps<{
  showAppName: boolean;
}>();

const appConfig = inject(APP_CONFIG_KEY, {name: "App", version: "0.0.0"});
const {name, logoSrc} = appConfig;
</script>

<template>
  <div class="flex items-center gap-2.5">
    <img v-if="logoSrc" :src="logoSrc" :alt="name ?? ''" :height="22"/>
    <span v-if="showAppName" class="text-base text-surface-900 font-bold tracking-wide truncate">
      {{ name }}
    </span>
  </div>
</template>

<style scoped>
img {
  display: block;
  object-fit: contain;
  max-height: 2.5rem;
}
</style>
