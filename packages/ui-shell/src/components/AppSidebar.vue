<script setup lang="ts">
import type {SidebarClasses} from "../types";

defineProps<{
  visible: boolean;
  classes?: SidebarClasses;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <aside v-if="visible"
         :class="['eaf-sidebar', 'hidden md:flex md:flex-col transition-all duration-300', classes?.root]"
  >
    <div :class="['eaf-sidebar-header', 'flex items-center justify-between px-4 flex-shrink-0', classes?.header]">
      <span class="eaf-sidebar-logo">
        <slot name="logo"/>
      </span>
      <!--            <Button icon="pi pi-times" text rounded severity="secondary" size="small" @click="emit('toggle')" aria-label="Close Sidebar" />-->
    </div>
    <div :class="['flex-1 overflow-y-auto p-3', classes?.body]">
      <slot/>
    </div>
  </aside>
</template>

<style>
@layer eaf-shell {
  .eaf-sidebar {
    width: 16rem;
    flex-shrink: 0;
    background-color: var(--p-surface-0);
    border-right: 1px solid var(--p-surface-200);
  }

  .eaf-sidebar-header {
    height: 3.5rem;
    border-bottom: 1px solid var(--p-surface-200);
  }

  .eaf-sidebar-logo {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: 0.025em;
    color: var(--p-surface-900);
  }
}
</style>
