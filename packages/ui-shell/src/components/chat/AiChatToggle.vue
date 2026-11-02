<script setup lang="ts">
import Button from "primevue/button";
import { useScopedI18n } from "../../composables/useScopedI18n";
import { useLayoutStore } from "../../stores/useLayoutStore";

const { t } = useScopedI18n();
const layoutStore = useLayoutStore();
</script>

<template>
  <!-- Above PrimeVue's modal masks (z-index 1100 and up, +1 per dialog), so it stays clickable
       while a dialog is open. Gone while the panel is open, which has its own close button.
       The wrapper takes the positioning because the Button root sets its own position. -->
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
