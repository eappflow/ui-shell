<script setup lang="ts">
import type { FooterClasses } from "../types";
import {inject} from "vue";
import {APP_CONFIG_KEY} from "../services/interfaces";

const appConfig = inject(APP_CONFIG_KEY);

const year = new Date().getFullYear();
</script>

<template>
  <footer
      :class="[
          'eaf-footer',
          appConfig.classes?.layout?.authorized?.footer?.root
      ]"
  >
    <span>
      &copy; {{ year }} <slot name="app-name" />. All rights reserved.
    </span>
    <slot name="right" />
  </footer>
</template>

<style>
@layer eaf-shell {
  .eaf-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 0.75rem 1.5rem;
    background-color: var(--p-surface-0);
    color: var(--p-surface-900);
    font-size: 0.75rem;
    border-top: 1px solid var(--p-surface-200);
  }
}
</style>
