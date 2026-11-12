<script setup lang="ts">
import { computed, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useEafAuth } from "../composables/useEafAuth";
import { filterVisibleMenuModules } from "../utils/permissions";
import type { EafMenuItem } from "../types";
import { useEafNavigation } from "../composables/useEafNavigation";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useMenuPreferencesStore } from "../stores/useMenuPreferencesStore";

const router = useRouter();
const route = useRoute();
const auth = useEafAuth();
const navigation = useEafNavigation();
const { t, te } = useI18n({ useScope: "global" });

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const prefs = useMenuPreferencesStore();

const PINNED_KEY = "__pinned__";

const props = defineProps<{
  compact?: boolean;
}>();

const emit = defineEmits<{
  "item-click": [item: EafMenuItem];
}>();

const visibleMenuModules = computed(() =>
  filterVisibleMenuModules(navigation.menuModules, auth.userPermissions),
);

// Pinned pages, flat, in the order the modules declare them
const pinnedItems = computed(() =>
  visibleMenuModules.value
    .flatMap((module) => module.items)
    .filter((item) => item.pinnable !== false && prefs.isPinned(item.path)),
);

// The rail has no room for headers, pins or folding: groups stay plain there
const sections = computed(() => {
  const groups = visibleMenuModules.value.map((module) => {
    const foldable = !props.compact && module.collapsible !== false;
    return {
      key: module.name,
      label: label(module),
      icon: module.icon,
      items: module.items,
      foldable,
      open: !foldable || !prefs.isCollapsed(module.name),
    };
  });
  if (props.compact || pinnedItems.value.length === 0) return groups;
  return [
    {
      key: PINNED_KEY,
      label: t("menu.pinned"),
      icon: "pi pi-bookmark",
      items: pinnedItems.value,
      foldable: true,
      open: !prefs.isCollapsed(PINNED_KEY),
    },
    ...groups,
  ];
});

function navigateToPage(item: EafMenuItem): void {
  router.push(item.path);
  emit("item-click", item);
}

function isActive(item: EafMenuItem): boolean {
  return route.path === item.path;
}

// Falls back to `name` when no key is set or no translation exists for it.
function label(entry: { name: string; nameKey?: string }): string {
  return entry.nameKey && te(entry.nameKey) ? t(entry.nameKey) : entry.name;
}
</script>

<template>
  <nav
    aria-label="Main"
    :data-compact="compact ? 'true' : 'false'"
    :class="[
      'flex w-full min-w-0 flex-col gap-1',
      appConfig.classes?.layout?.authorized?.menu?.root,
    ]"
  >
    <section
      v-for="section in sections"
      :key="section.key"
      class="flex flex-col"
    >
      <!-- Header row: icon, name, chevron on the far right.
           Not <button>s: the host theme paints those, a div takes nothing but our classes. -->
      <div v-if="!compact" class="flex items-center">
        <div
          :role="section.foldable ? 'button' : undefined"
          :tabindex="section.foldable ? 0 : undefined"
          :aria-expanded="section.foldable ? section.open : undefined"
          :class="[
            'flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
            section.foldable ? 'cursor-pointer' : 'cursor-default',
            appConfig.classes?.layout?.authorized?.menu?.['group-label'],
          ]"
          @click="section.foldable && prefs.toggleGroup(section.key)"
          @keydown.enter.prevent="
            section.foldable && prefs.toggleGroup(section.key)
          "
          @keydown.space.prevent="
            section.foldable && prefs.toggleGroup(section.key)
          "
        >
          <span class="flex w-5 shrink-0 items-center justify-center">
            <i :class="[section.icon, 'text-[18px]!']" />
          </span>
          <span class="truncate">{{ section.label }}</span>
          <i
            v-if="section.foldable"
            :class="[
              'pi ml-auto text-[0.625rem]! opacity-70',
              section.open ? 'pi-chevron-down' : 'pi-chevron-right',
            ]"
          />
        </div>
      </div>

      <!-- Rail: a divider where the header would be -->
      <span
        v-else
        class="flex h-4 items-center justify-center"
        :class="appConfig.classes?.layout?.authorized?.menu?.['group-label']"
      >
        <span class="h-px w-5 shrink-0 bg-eaf-card-border" />
        <span class="sr-only">{{ section.label }}</span>
      </span>

      <ul
        v-show="section.open"
        :class="[
          'm-0 flex list-none flex-col',
          !compact && 'ml-5 border-l border-eaf-card-border pl-5',
        ]"
      >
        <li
          v-for="item in section.items"
          :key="item.path"
          class="group/row flex items-center"
        >
          <a
            :href="item.path"
            :aria-current="isActive(item) ? 'page' : undefined"
            :class="[
              'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] font-medium',
              // The rail is narrower than the icon: centring keeps it on the rail's axis
              compact && 'justify-center',
              appConfig.classes?.layout?.authorized?.menu?.item,
              isActive(item) && 'font-semibold bg-eaf-highlight',
              isActive(item) &&
                appConfig.classes?.layout?.authorized?.menu?.['item-active'],
            ]"
            @click.prevent="navigateToPage(item)"
          >
            <!-- 1lh: a label line tall, so the row keeps its height once the label is gone -->
            <span
              v-if="item.icon"
              class="flex h-[1lh] w-5 shrink-0 items-center justify-center"
            >
              <i
                :class="[item.icon, isActive(item) && 'text-primary']"
                class="text-[18px] opacity-90"
              />
            </span>
            <!-- Compact keeps the label for screen readers, the icon stays put -->
            <span :class="compact ? 'sr-only' : 'truncate'">{{
              label(item)
            }}</span>
          </a>
          <span
            v-if="!compact && item.pinnable !== false"
            role="button"
            tabindex="0"
            :aria-pressed="prefs.isPinned(item.path)"
            :aria-label="
              prefs.isPinned(item.path) ? t('menu.unpin') : t('menu.pin')
            "
            :title="prefs.isPinned(item.path) ? t('menu.unpin') : t('menu.pin')"
            :class="[
              'group/pin -ml-8 mr-2 shrink-0 cursor-pointer px-1',
              !prefs.isPinned(item.path) &&
                'opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-60',
            ]"
            @click="prefs.togglePin(item.path)"
            @keydown.enter.prevent="prefs.togglePin(item.path)"
            @keydown.space.prevent="prefs.togglePin(item.path)"
          >
            <!-- Pinned: a filled yellow star that turns hollow on hover, as the hint it unpins.
                     `!`: primeicons' unlayered .pi sets display, beating the utilities -->
            <template v-if="prefs.isPinned(item.path)">
              <i
                class="pi pi-star-fill text-xs! text-yellow-400 group-hover/pin:hidden!"
              />
              <i
                class="pi pi-star hidden! text-xs! text-yellow-400 group-hover/pin:inline-block!"
              />
            </template>
            <i v-else class="pi pi-star text-xs!" />
          </span>
        </li>
      </ul>
    </section>
  </nav>
</template>
