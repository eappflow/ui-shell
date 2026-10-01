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

const props = defineProps<{
  compact?: boolean;
}>();

const emit = defineEmits<{
  "item-click": [item: EafMenuItem];
}>();

const visibleMenuModules = computed(() =>
  filterVisibleMenuModules(navigation.menuModules, auth.userPermissions),
);

// Compact (collapsed sidebar) flattens the groups — the icon rail has no
// room for group labels.
const menuModel = computed(() =>
  props.compact
    ? visibleMenuModules.value.flatMap((module) => module.items)
    : visibleMenuModules.value.map((module) => ({
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
  <nav
    aria-label="Main"
    :data-compact="compact ? 'true' : 'false'"
  >
    <Menu
      :model="menuModel"
      :class="[
        'w-full min-w-0! border-none! bg-transparent!',
        appConfig.classes?.layout?.authorized?.menu?.root,
      ]"
    >
      <template #submenulabel="{ item }">
        <span
          :class="[
            'text-[0.65625rem] uppercase tracking-[0.7px]',
            appConfig.classes?.layout?.authorized?.menu?.['group-label'],
          ]"
        >
          {{ item.label }}
        </span>
      </template>

      <template #item="{ item, props: itemProps }">
        <a
          v-bind="itemProps.action"
          :class="[
            'flex w-full min-w-0! text-[0.8125rem] font-medium',
            compact
              ? // px-0! drops menu.item.padding, which .p-menu-item-link adds
                // via props.action and which leaves the caption too little room.
                'flex-col items-center justify-center gap-0.5 py-1 px-0!'
              : 'items-center',
            appConfig.classes?.layout?.authorized?.menu?.item,
            isActive(item) && 'font-semibold bg-eaf-highlight',
            isActive(item) &&
              appConfig.classes?.layout?.authorized?.menu?.['item-active'],
          ]"
          @click="navigateToPage(asEafMenuItem(item))"
        >
          <span
            v-if="item.icon"
            :class="[
              'flex shrink-0 items-center justify-center',
              compact ? 'h-8 w-8' : 'w-5',
            ]"
          >
            <i
              :class="[item.icon, isActive(item) && 'text-primary']"
              class="text-[18px] opacity-90"
            />
          </span>
          <span
            :class="
              compact
                ? 'w-full text-center text-[9px] leading-tight break-normal hyphens-none opacity-80'
                : 'truncate'
            "
          >{{ label(asEafMenuItem(item)) }}</span>
        </a>
      </template>
    </Menu>
  </nav>
</template>

<style scoped>
/* Collapsed rail: a touch more air than PrimeVue's 2px list gap. */
nav[data-compact="true"] :deep(.p-menu-list) {
  gap: 0.25rem;
}
</style>
