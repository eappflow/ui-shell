<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useScopedI18n } from "../composables/useScopedI18n";
import { STORAGE_KEYS } from "../utils/constants";

const props = withDefaults(
  defineProps<{
    /** Right: docked over the layout, which makes room for it. Left: in the page, which places it (e.g. sticky). */
    side?: "left" | "right";
  }>(),
  { side: "right" },
);
const open = defineModel<boolean>("open", { required: true });

const { t } = useScopedI18n();
const aside = useTemplateRef<HTMLElement>("aside");
const left = props.side === "left";

// Dragged by its inner edge, each side keeping its own width. The layout's
// margin and the dialogs' room (style/index.css) follow --eaf-aside-width
// too, and min() keeps all of them in a narrowed window.
const { storageKey, cssVar, initial, min } = left
  ? {
      storageKey: STORAGE_KEYS.ASIDE_LEFT_WIDTH,
      cssVar: "--eaf-aside-left-width",
      initial: 288,
      min: 224,
    }
  : {
      storageKey: STORAGE_KEYS.ASIDE_WIDTH,
      cssVar: "--eaf-aside-width",
      initial: 416,
      min: 320,
    };
const width = useLocalStorage(storageKey, initial);
watchEffect(() =>
  document.documentElement.style.setProperty(
    cssVar,
    `min(${width.value}px, 70vw)`,
  ),
);

function setWidth(px: number) {
  width.value = Math.round(
    Math.min(Math.max(px, min), window.innerWidth * 0.7),
  );
}

/** Widens by `px`, or narrows when negative */
const widen = (px: number) =>
  setWidth((aside.value?.offsetWidth ?? width.value) + px);

// While dragging, the layout's margin keeps up rather than easing after the edge
const setResizing = (resizing: boolean) =>
  document.documentElement.classList.toggle("eaf-aside-resizing", resizing);

function startResize(event: PointerEvent) {
  event.preventDefault(); // no text selection while dragging
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setResizing(true);
}

function resize(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = aside.value?.getBoundingClientRect();
  if (rect && target.hasPointerCapture(event.pointerId)) {
    setWidth(left ? event.clientX - rect.left : rect.right - event.clientX);
  }
}
</script>

<template>
  <!-- A full-height column that slides in, for what the slot holds. On the right AuthorizedLayout
       makes room for it, header included, so its top row lines up with the header - below PrimeVue's
       overlays (z-index 1000 and up), so menus that reach over it stay on top. On the left it's in
       the page, which places it. Closed, it waits off its edge, invisible once the slide out has finished. -->
  <aside
    ref="aside"
    :data-open="open"
    :data-side="side"
    :style="{ width: `var(${cssVar})` }"
    :class="[
      'eaf-aside bg-eaf-card text-eaf-ink border-eaf-card-border flex max-w-full flex-col duration-300 motion-reduce:transition-none',
      left ? 'border-r' : 'fixed inset-y-0 right-0 z-900 border-l',
      // Visibility only waits for the slide when closing - opening, it has to
      // be visible at once for its content to take the focus.
      open
        ? 'translate-x-0 transition-[translate]'
        : [
            'invisible transition-[translate,visibility]',
            left ? '-translate-x-full' : 'translate-x-full',
          ],
    ]"
    data-testid="app-aside"
    @keydown.esc="open = false"
  >
    <!-- The inner edge widens or narrows it, as do the arrow keys on it - from md up, where it sits beside the page -->
    <div
      :class="[
        'hover:bg-primary/40 focus-visible:bg-primary/40 absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none outline-none max-md:hidden',
        left ? '-right-1' : '-left-1',
      ]"
      role="separator"
      aria-orientation="vertical"
      tabindex="0"
      :aria-label="
        t('aside_resize', 'Resize the side panel', 'Zmień szerokość panelu')
      "
      data-testid="aside-resize-handle"
      @pointerdown="startResize"
      @pointermove="resize"
      @lostpointercapture="setResizing(false)"
      @keydown.left.prevent="widen(left ? -16 : 16)"
      @keydown.right.prevent="widen(left ? 16 : -16)"
    />
    <slot />
  </aside>
</template>
