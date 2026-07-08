<script setup lang="ts">
import { inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useEafLogo } from "../composables/useEafLogo";
import { LogoPlacement } from "../types/eaf-logo";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

const props = defineProps<{
  showAppName: boolean;
  placement?: LogoPlacement;
  classImage?: string;
}>();

const { logoSrc } = useEafLogo(() => props.placement);
</script>

<template>
  <div class="flex items-center gap-2.5">
    <img
        v-if="logoSrc"
        :class="['eaf-logo', classImage]"
        :src="logoSrc"
        :alt="appConfig.name ?? 'logo'"
    />
    <span
      v-if="showAppName"
      class="text-base text-surface-900 font-bold tracking-wide truncate"
    >
      {{ appConfig.name }}
    </span>
  </div>
</template>

<style>
@layer eaf-shell {
  .eaf-logo {
    display: block;
    object-fit: contain;
    max-height: 3rem;
  }
}
</style>
