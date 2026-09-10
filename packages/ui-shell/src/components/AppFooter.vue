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
    :class="['flex items-center justify-between shrink-0 px-6 py-3 text-sm border-t border-surface-200 dark:border-surface-600! bg-surface-0 dark:bg-surface-900!', appConfig.classes?.layout?.authorized?.footer?.root]">
    <span>
      &copy; {{ year }}
      <slot name="app-name" />.
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
