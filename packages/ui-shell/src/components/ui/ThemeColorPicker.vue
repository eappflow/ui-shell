<script setup lang="ts">
import { useEafLayout } from "../../composables/useEafLayout";
import { useScopedI18n } from "../../composables/useScopedI18n";

const layout = useEafLayout();
const { t } = useScopedI18n();
</script>

<template>
  <div
    v-if="layout.availableColors.length > 0"
    class="flex flex-col gap-2"
  >
    <span class="text-sm">{{
      t("theme_color", "Theme Color", "Kolor motywu")
    }}</span>
    <div class="flex gap-2">
      <button
        v-for="name in layout.availableColors"
        :key="name"
        type="button"
        class="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
        :class="
          layout.primaryColor === name
            ? 'border-surface-900 dark:border-surface-0'
            : 'border-transparent'
        "
        :style="{ backgroundColor: `var(--p-${name}-500)` }"
        :aria-label="name"
        :data-testid="`theme-color-${name}`"
        @click="layout.setPrimaryColor(name)"
      />
    </div>
  </div>
</template>
