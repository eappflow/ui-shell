<script setup lang="ts">
import { inject } from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useScopedI18n } from "../composables/useScopedI18n";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const { t } = useScopedI18n();

const year = new Date().getFullYear();
</script>

<template>
  <footer
    :class="['eaf-footer', appConfig.classes?.layout?.authorized?.footer?.root]"
  >
    <span>
      &copy; {{ year }} <slot name="app-name" />.
      {{
        t(
          "allRightsReserved",
          "All rights reserved.",
          "Wszystkie prawa zastrzeżone.",
        )
      }}
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
