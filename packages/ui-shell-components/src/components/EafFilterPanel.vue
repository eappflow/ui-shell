<script setup lang="ts">
import { ref, watch } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    storageKey: string;
    title?: string;
    activeFilters?: ActiveFilter[];
    defaultCollapsed?: boolean;
    loading?: boolean;
    clearDisabled?: boolean;
    showRefresh?: boolean;
    showClear?: boolean;
  }>(),
  {
    title: "Filters",
    activeFilters: () => [],
    defaultCollapsed: false,
    loading: false,
    clearDisabled: false,
    showRefresh: true,
    showClear: true,
  },
);

const emit = defineEmits<{
  "remove-filter": [key: string];
  refresh: [];
  clear: [];
}>();

const collapsed = ref(props.defaultCollapsed);
const persistedStateKey = `filterPanel.${props.storageKey}.collapsed`;

try {
  const savedState = localStorage.getItem(persistedStateKey);
  if (savedState !== null) {
    collapsed.value = savedState === "true";
  }
} catch (error) {
  console.warn(
    `Failed to load filter panel state (${persistedStateKey}):`,
    error,
  );
}

watch(collapsed, (value) => {
  try {
    localStorage.setItem(persistedStateKey, String(value));
  } catch (error) {
    console.warn(
      `Failed to save filter panel state (${persistedStateKey}):`,
      error,
    );
  }
});
</script>

<template>
  <Card>
    <template #content>
      <div class="space-y-3">
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div
            class="min-w-0 flex flex-1 flex-wrap items-center gap-2 overflow-hidden"
          >
            <span
              class="inline-flex shrink-0 items-center gap-2 text-2xl font-bold text-surface-900 dark:text-surface-100"
            >
              {{ title }}
            </span>

            <Button
              v-if="showRefresh"
              icon="pi pi-refresh"
              size="small"
              severity="secondary"
              text
              rounded
              @click="emit('refresh')"
              :loading="loading"
              v-tooltip.top="'Refresh'"
            />
            <Button
              v-if="showClear"
              icon="pi pi-filter-slash"
              size="small"
              severity="secondary"
              text
              rounded
              @click="emit('clear')"
              :disabled="loading || clearDisabled"
              v-tooltip.top="'Clear filters'"
            />

            <div
              v-if="collapsed && activeFilters.length"
              class="flex min-w-0 flex-wrap items-center gap-2"
            >
              <span
                v-for="filter in activeFilters"
                :key="filter.key"
                class="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 px-2 py-1 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
              >
                <span class="truncate"
                  >{{ filter.label }}: {{ filter.value }}</span
                >
                <button
                  type="button"
                  class="inline-flex h-4 w-4 items-center justify-center rounded-full text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-900 dark:hover:bg-surface-700 dark:hover:text-surface-0"
                  :aria-label="`Remove ${filter.label} filter`"
                  @click="emit('remove-filter', filter.key)"
                >
                  <i class="pi pi-times text-xs"></i>
                </button>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-auto">
            <slot name="actions" />
            <Button
              :icon="collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
              :label="collapsed ? 'Show' : 'Hide'"
              severity="secondary"
              text
              @click="collapsed = !collapsed"
            />
          </div>
        </div>

        <div v-show="!collapsed">
          <slot />
        </div>
      </div>
    </template>
  </Card>
</template>
