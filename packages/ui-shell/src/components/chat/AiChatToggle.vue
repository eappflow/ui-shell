<script setup lang="ts">
import Button from "primevue/button";
import { useScopedI18n } from "../../composables/useScopedI18n";
import { useLayoutStore } from "../../stores/useLayoutStore";

const { t } = useScopedI18n();
const layoutStore = useLayoutStore();
</script>

<template>
  <div
    v-if="!layoutStore.chatPanelOpen"
    class="fixed! bottom-4! right-4! z-2000"
  >
    <Button
      :label="t('chat_ask_ai', 'Ask AI', 'Zapytaj AI')"
      icon="pi pi-sparkles"
      rounded
      raised
      data-testid="ai-chat-button"
      @click="layoutStore.toggleChatPanel()"
    />
  </div>
</template>
