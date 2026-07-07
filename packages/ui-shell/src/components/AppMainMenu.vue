<script setup lang="ts">
import {computed, inject} from "vue";
import { useRouter, useRoute } from "vue-router";
import Menu from "primevue/menu";
import type { MenuItem } from "primevue/menuitem";
import { useEafAuth } from "../composables/useEafAuth";
import { filterVisibleMenuModules } from "../utils/permissions";
import type { EafMenuItem, MenuClasses } from "../types";
import { useEafNavigation } from "../composables/useEafNavigation";
import {APP_CONFIG_KEY} from "../services/interfaces";

const router = useRouter();
const route = useRoute();
const auth = useEafAuth();
const navigation = useEafNavigation();

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

// PrimeVue's Menu model natively supports one level of grouping via
// { label, items: [...] } - module.name becomes the group label,
// module.items (real EafMenuItem[]) is passed through completely
// untouched, no reshaping/renaming of your fields.
const menuModel = computed(() =>
  visibleMenuModules.value.map((module) => ({
    label: module.name,
    items: module.items,
  })),
);

// Unchanged from your original - same router.push, same emit.
function navigateToPage(item: EafMenuItem): void {
  router.push(item.path);
  emit("item-click", item);
}

// Unchanged from your original.
function isActive(itemPath: string): boolean {
  return route.path === itemPath;
}

// Menu isn't a generic component, so its #item slot always types `item`
// as PrimeVue's own MenuItem, even though menuModel only ever contains
// real EafMenuItem objects (we put them there ourselves, untouched, a
// few lines up). This is the one, explicit place that bridges the two -
// not a workaround for a bug, just the expected way to cross a slot
// boundary PrimeVue can't type-check for us.
function asEafMenuItem(item: MenuItem): EafMenuItem {
  return item as EafMenuItem;
}
</script>

<template>
  <nav aria-label="Main">
    <Menu
        :model="menuModel"
        :class="[
            'eaf-menu',
            appConfig.classes?.layout?.authorized?.menu?.root
        ]"
    >
      <template #submenulabel="{ item }">
        <span
            :class="[
                'eaf-menu-group-label',
                appConfig.classes?.layout?.authorized?.menu?.['group-label']
            ]"
        >
          {{ item.label }}
        </span>
      </template>

      <template #item="{ item, props: itemProps }">
        <a
          v-bind="itemProps.action"
          :class="[
            'eaf-menu-item',
            appConfig.classes?.layout?.authorized?.menu?.item,
            isActive(asEafMenuItem(item).path) && 'eaf-menu-item-active',
            isActive(asEafMenuItem(item).path) && appConfig.classes?.layout?.authorized?.menu?.['item-active'],
          ]"
          @click="navigateToPage(asEafMenuItem(item))"
        >
          <i
            v-if="item.icon"
            :class="item.icon"
            class="w-5 shrink-0 text-[18px] opacity-90"
          />
          <span class="truncate">{{ asEafMenuItem(item).name }}</span>
        </a>
      </template>
    </Menu>
  </nav>
</template>

<style>
@layer eaf-shell {
  .eaf-menu {
    width: 100%;
  }

  .eaf-menu-group-label {
    font-size: 0.65625rem;
    text-transform: uppercase;
    letter-spacing: 0.7px;
  }

  .eaf-menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .eaf-menu-item-active {
    font-weight: 600;
    color: var(--p-primary-color);
    background-color: var(--p-primary-50);
  }
}
</style>
