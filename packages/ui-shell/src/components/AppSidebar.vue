<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import Button from "primevue/button";
import { APP_CONFIG_KEY } from "../services/interfaces";

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

const props = defineProps<{
  /** When true the sidebar shrinks to an icon-only rail instead of hiding. */
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const hovered = ref(false);
/** Collapsed and hovered: the rail widens over the page, the layout keeps the rail's width. */
const peek = computed(() => props.collapsed && hovered.value);
/** The panel's width: full unless it's the bare rail. */
const wide = computed(() => !props.collapsed || hovered.value);
/** What the slots should render: the icon-only rail. Only once the panel has shrunk (duration-200), so the labels don't vanish mid-animation. */
const compact = ref(!wide.value);
let compactTimer: ReturnType<typeof setTimeout> | undefined;
watch(wide, (isWide) => {
  clearTimeout(compactTimer);
  if (isWide) compact.value = false;
  else compactTimer = setTimeout(() => (compact.value = true), 200);
});

// The pointer is still on the button: without the reset, collapsing would leave the rail peeking.
function toggle(): void {
  hovered.value = false;
  emit("toggle");
}
</script>

<template>
  <!-- Holds the sidebar's place in the layout; the panel inside may overflow it while peeking -->
  <aside
    data-testid="app-sidebar"
    :data-collapsed="collapsed ? 'true' : 'false'"
    :data-peek="peek ? 'true' : 'false'"
    :class="[
      'hidden md:block relative shrink-0 h-screen transition-[width] duration-200 motion-reduce:transition-none',
      collapsed ? 'w-16' : 'w-64',
      appConfig.classes?.layout?.authorized?.sidebar?.root,
    ]"
  >
    <div
      :class="[
        'absolute inset-y-0 left-0 flex flex-col overflow-hidden bg-eaf-card border-r border-eaf-card-border transition-[width,box-shadow] duration-200 motion-reduce:transition-none',
        wide ? 'w-64' : 'w-16',
        peek && 'shadow-xl',
        // Above the page through the shrinking too, not just while peeking
        collapsed && !compact && 'z-40',
      ]"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <div
        :class="[
          'flex items-center shrink-0 h-14 border-b border-eaf-card-border',
          compact ? 'justify-center px-0' : 'justify-between px-4',
          appConfig.classes?.layout?.authorized?.sidebar?.header,
        ]"
      >
        <span class="text-lg font-bold tracking-wide text-eaf-ink">
          <slot name="logo" :compact="compact" />
        </span>
      </div>
      <div
        :class="[
          'flex-1 overflow-x-hidden overflow-y-auto p-2',
          appConfig.classes?.layout?.authorized?.sidebar?.body,
        ]"
      >
        <slot :compact="compact" />
      </div>
      <!-- px-4 centres the button in the rail and keeps it left when expanded -->
      <div
        class="flex items-center shrink-0 h-14 px-4 border-t border-eaf-card-border"
      >
        <Button
          :icon="
            collapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'
          "
          class="p-0 h-8 w-8"
          data-testid="toggle-sidebar-button"
          text
          rounded
          aria-label="Toggle Sidebar"
          @click="toggle"
        />
      </div>
    </div>
  </aside>
</template>
