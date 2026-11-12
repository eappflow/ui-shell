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
import { useUserPreferencesStore } from "../stores/useUserPreferencesStore";
import { useScopedI18n } from "../composables/useScopedI18n";

const router = useRouter();
const route = useRoute();
const auth = useEafAuth();
const navigation = useEafNavigation();
const { t, te } = useI18n({ useScope: "global" });
const { t: shellT } = useScopedI18n();

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
// The host's own classes for the menu's parts
const hostClasses = appConfig.classes?.layout?.authorized?.menu;
const preferences = useUserPreferencesStore();

const props = defineProps<{
  compact?: boolean;
}>();

// Not while loading: a star then would show the user's pins as not there
const showPins = computed(() => !props.compact && !preferences.loading);

const emit = defineEmits<{
  "item-click": [item: EafMenuItem];
}>();

const visibleMenuModules = computed(() =>
  filterVisibleMenuModules(navigation.menuModules, auth.userPermissions),
);

const menuModel = computed(() => {
  const groups = visibleMenuModules.value.map((module) => ({
    label: label(module),
    items: module.items,
  }));

  const pinned = groups
    .flatMap((group) => group.items)
    .filter((item) => isPinned(item.path))
    .map((item) => ({ ...item, inPinnedGroup: true }));
  return pinned.length || preferences.loading
    ? [
        {
          label: shellT("menu_pinned", "Pinned", "Przypięte"),
          items: pinned,
          loading: preferences.loading,
        },
        ...groups,
      ]
    : groups;
});

function isPinned(path: string): boolean {
  return preferences.pinnedPages.includes(path);
}

// A pinned page's star shows outside the Pinned group - in it every row is pinned
function starAlwaysShown(item: MenuItem): boolean {
  return isPinned(item.path) && !item.inPinnedGroup;
}

function navigateToPage(item: EafMenuItem): void {
  router.push(item.path);
  emit("item-click", item);
}

function isActive(item: MenuItem): boolean {
  return route.path === item.path;
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
      class="w-full min-w-0! border-none! bg-transparent!"
      :class="hostClasses?.root"
    >
      <!-- Compact: the group name gives way to a divider of the same height, so nothing shifts on expand -->
      <template #submenulabel="{ item }">
        <span
          class="flex h-4 items-center text-[0.65625rem] uppercase tracking-[0.7px] whitespace-nowrap"
          :class="[compact && 'justify-center', hostClasses?.['group-label']]"
        >
          <!-- As wide as the item icons below, on the same axis -->
          <span v-if="compact" class="h-px w-5 shrink-0 bg-eaf-card-border" />
          <span :class="compact && 'sr-only'">{{ item.label }}</span>
          <i
            v-if="item.loading && !compact"
            class="pi pi-spinner pi-spin ml-2 text-xs"
          />
        </span>
      </template>

      <template #item="{ item, props: itemProps }">
        <div class="group relative">
          <a
            v-bind="itemProps.action"
            class="flex items-center w-full min-w-0! text-[0.8125rem] font-medium"
            :class="[
              // The rail is narrower than the icon: centring keeps it on the rail's axis
              compact && 'justify-center',
              // Room for the star, so a long label truncates before it
              showPins && 'pr-8!',
              hostClasses?.item,
              isActive(item) && [
                'font-semibold bg-eaf-highlight',
                hostClasses?.['item-active'],
              ],
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
                class="text-lg opacity-90"
              />
            </span>
            <!-- Compact keeps the label for screen readers, the icon stays put -->
            <span :class="compact ? 'sr-only' : 'truncate'">{{
              label(asEafMenuItem(item))
            }}</span>
          </a>
          <!-- Beside the link, not in it: a button inside an <a> isn't valid HTML.
               Otherwise shown on hover or focus only. -->
          <button
            v-if="showPins"
            type="button"
            :aria-pressed="isPinned(item.path)"
            :aria-label="shellT('menu_pin', 'Pin', 'Przypnij')"
            class="absolute inset-y-0 right-2 flex cursor-pointer items-center px-1"
            :class="[
              !starAlwaysShown(item) &&
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            ]"
            @click.stop="preferences.togglePin(item.path)"
          >
            <i
              class="pi text-xs"
              :class="
                isPinned(item.path) ? 'pi-star-fill text-yellow-400' : 'pi-star'
              "
            />
          </button>
        </div>
      </template>
    </Menu>
  </nav>
</template>
