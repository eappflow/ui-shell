<script setup lang="ts">
import { inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

defineProps<{
  /** When true the sidebar shrinks to an icon-only rail instead of hiding. */
  collapsed?: boolean;
}>();
</script>

<template>
  <aside
    data-testid="app-sidebar"
    :data-collapsed="collapsed ? 'true' : 'false'"
    :class="[
      'hidden md:flex md:flex-col shrink-0 h-screen bg-transparent border-r border-eaf-card-border',
      collapsed ? 'w-24' : 'w-64',
      appConfig.classes?.layout?.authorized?.sidebar?.root,
    ]"
  >
    <div
      :class="[
        'flex items-center shrink-0 h-14',
        collapsed ? 'justify-center px-0' : 'justify-between px-4',
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
