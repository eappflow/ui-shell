<script setup lang="ts">
import { inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

defineProps<{
  visible: boolean;
}>();
</script>

<template>
  <aside
    v-if="visible"
    data-testid="app-sidebar"
    :class="[
      'hidden md:flex md:flex-col transition-all duration-300 bg-transparent w-64 border-r border-eaf-card-border',
      appConfig.classes?.layout?.authorized?.sidebar?.root,
    ]"
  >
    <div
      :class="[
        'flex items-center justify-between px-4 shrink-0 h-14 border-b border-eaf-card-border',
        appConfig.classes?.layout?.authorized?.sidebar?.header,
      ]"
    >
      <span class="text-lg font-bold tracking-wide text-eaf-ink">
        <slot name="logo" />
      </span>
    </div>
    <div
      :class="[
        'flex-1 overflow-y-auto p-2',
        appConfig.classes?.layout?.authorized?.sidebar?.body,
      ]"
    >
      <slot />
    </div>
  </aside>
</template>
