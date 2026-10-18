<script setup lang="ts">
import { inject } from "vue";
import Button from "primevue/button";
import AccountMenu from "./AccountMenu.vue";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useScopedI18n } from "../composables/useScopedI18n";

const { t } = useScopedI18n();

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

defineProps<{
  /** Shows the "Ask AI" button, which emits `toggleAiChat` */
  aiChat?: boolean;
}>();

const emit = defineEmits<{
  toggleSidebar: [];
  logout: [];
  toggleAiChat: [];
}>();
</script>

<template>
  <header
    :class="['eaf-header', appConfig.classes?.layout?.authorized?.header?.root]"
  >
    <div class="flex flex-1 items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-bars"
          class="p-0 h-8 w-8 md:hidden!"
          data-testid="mobile-sidebar-button"
          text
          rounded
          aria-label="Toggle Sidebar"
          @click="emit('toggleSidebar')"
        />
        <h1
          :class="[
            'eaf-header-title md:hidden',
            appConfig.classes?.layout?.authorized?.header?.title,
          ]"
        >
          <slot name="app-name" />
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="aiChat"
          :label="t('chat_ask_ai', 'Ask AI', 'Zapytaj AI')"
          icon="pi pi-sparkles"
          size="small"
          text
          data-testid="ai-chat-button"
          @click="emit('toggleAiChat')"
        />
        <AccountMenu @logout="emit('logout')" />
      </div>
    </div>
  </header>
</template>
