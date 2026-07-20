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
      'eaf-sidebar',
      'hidden md:flex md:flex-col transition-all duration-300',
      appConfig.classes?.layout?.authorized?.sidebar?.root,
    ]"
  >
    <div
      :class="[
        'eaf-sidebar-header',
        'flex items-center justify-between px-4 flex-shrink-0',
        appConfig.classes?.layout?.authorized?.sidebar?.header,
      ]"
    >
      <span class="eaf-sidebar-logo">
        <slot name="logo" />
      </span>
    </div>
    <div
      :class="[
        'flex-1 overflow-y-auto p-3',
        appConfig.classes?.layout?.authorized?.sidebar?.body,
      ]"
    >
      <slot />
    </div>
  </aside>
</template>

<style>
@layer eaf-shell {
  .eaf-sidebar {
    width: 16rem;
    flex-shrink: 0;
    background-color: var(--p-surface-0);
    border-right: 1px solid var(--p-surface-200);
  }

  .eaf-sidebar-header {
    height: 3.5rem;
    border-bottom: 1px solid var(--p-surface-200);
  }

  .eaf-sidebar-logo {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: 0.025em;
    color: var(--p-surface-900);
  }
}
</style>
