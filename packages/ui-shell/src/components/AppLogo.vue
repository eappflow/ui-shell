<script setup lang="ts">
import { EafLogo } from "@eappflow/ui-shell-components";

const props = defineProps<{
  appName: string;
  logoSrc?: string;
}>();
</script>

<template>
  <div class="flex items-center gap-2.5">
    <EafLogo v-if="logoSrc" :src="logoSrc" :alt="appName" :height="22" />
    <span class="text-base text-surface-900 font-bold tracking-wide truncate">
      {{ appName }}
    </span>
  </div>
</template>
