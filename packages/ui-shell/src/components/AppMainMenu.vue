<script setup lang="ts">
import { computed, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Menu from "primevue/menu";
import type { MenuItem } from "primevue/menuitem";
import { useEafAuth } from "../composables/useEafAuth";
import { filterVisibleMenuModules } from "../utils/permissions";
import type { EafMenuItem } from "../types";
import { useEafNavigation } from "../composables/useEafNavigation";
import { APP_CONFIG_KEY } from "../services/interfaces";

const router = useRouter();
const route = useRoute();
const auth = useEafAuth();
const navigation = useEafNavigation();
const { t, te } = useI18n({ useScope: "global" });

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

defineProps<{
  compact?: boolean;
}>();

const emit = defineEmits<{
  "item-click": [item: EafMenuItem];
}>();

const visibleMenuModules = computed(() =>
  filterVisibleMenuModules(navigation.menuModules, auth.userPermissions),
);

const menuModel = computed(() =>
  visibleMenuModules.value.map((module) => ({
    label: label(module),
    items: module.items,
  })),
);

function navigateToPage(item: EafMenuItem): void {
  router.push(item.path);
  emit("item-click", item);
}

function isActive(item: MenuItem): boolean {
  return route.path === asEafMenuItem(item).path;
}

// Falls back to `name` when no key is set or no translation exists for it.
function label(entry: { name: string; nameKey?: string }): string {
  return entry.nameKey && te(entry.nameKey) ? t(entry.nameKey) : entry.name;
}

// Menu isn't generic, so its #item slot types `item` as PrimeVue's MenuItem,
// even though menuModel only ever holds EafMenuItem objects.
function asEafMenuItem(item: MenuItem): EafMenuItem {
  return item as EafMenuItem;
}
</script>

<template>
  <nav aria-label="Main" :data-compact="compact ? 'true' : 'false'">
    <Menu
      :model="menuModel"
      :class="[
        'w-full min-w-0! border-none! bg-transparent!',
        appConfig.classes?.layout?.authorized?.menu?.root,
      ]"
    >
      <!-- Compact: the group name gives way to a divider of the same height, so nothing shifts on expand -->
      <template #submenulabel="{ item }">
        <span
          :class="[
            'flex h-4 items-center text-[0.65625rem] uppercase tracking-[0.7px] whitespace-nowrap',
            compact && 'justify-center',
            appConfig.classes?.layout?.authorized?.menu?.['group-label'],
          ]"
        >
          <!-- As wide as the item icons below, on the same axis -->
          <span v-if="compact" class="h-px w-5 shrink-0 bg-eaf-card-border" />
          <span :class="compact && 'sr-only'">{{ item.label }}</span>
        </span>
      </template>

      <template #item="{ item, props: itemProps }">
        <a
          v-bind="itemProps.action"
          :class="[
            'flex items-center w-full min-w-0! text-[0.8125rem] font-medium',
            // The rail is narrower than the icon: centring keeps it on the rail's axis
            compact && 'justify-center',
            appConfig.classes?.layout?.authorized?.menu?.item,
            isActive(item) && 'font-semibold bg-eaf-highlight',
            isActive(item) &&
              appConfig.classes?.layout?.authorized?.menu?.['item-active'],
          ]"
          @click="navigateToPage(asEafMenuItem(item))"
        >
          <!-- 1lh: a label line tall, so the row keeps its height once the label is gone -->
          <span
            v-if="item.icon"
            class="flex shrink-0 items-center justify-center w-5 h-[1lh]"
          >
            <i
              :class="[item.icon, isActive(item) && 'text-primary']"
              class="text-[18px] opacity-90"
            />
          </span>
          <!-- Compact keeps the label for screen readers, the icon stays put -->
          <span :class="compact ? 'sr-only' : 'truncate'">{{
            label(asEafMenuItem(item))
          }}</span>
        </a>
      </template>
    </Menu>
  </nav>
</template>
