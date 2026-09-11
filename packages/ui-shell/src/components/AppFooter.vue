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
    :class="[
      'flex items-center justify-between shrink-0 px-6 py-3 text-sm text-surface-500 dark:text-surface-400',
      appConfig.classes?.layout?.authorized?.footer?.root,
    ]"
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
