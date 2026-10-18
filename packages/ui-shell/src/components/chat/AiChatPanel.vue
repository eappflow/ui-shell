<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import { useEafChat } from "@eappflow/ui-shell-components";
import { useScopedI18n } from "../../composables/useScopedI18n";
import ChatComposer from "./ChatComposer.vue";
import ChatMessageList from "./ChatMessageList.vue";
import ChatPanelHeader from "./ChatPanelHeader.vue";

const props = defineProps<{
  /** Whether the aside it is in is open */
  open: boolean;
}>();
const emit = defineEmits<{
  close: [];
}>();

const { t } = useScopedI18n();
const {
  conversations,
  activeId,
  messages,
  sending,
  loading,
  models,
  modelKey,
  load,
  open: openConversation,
  startNew,
  send,
} = useEafChat();

const panel = useTemplateRef<HTMLElement>("panel");

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    // Fresh each time, as the full-page chat may have changed them meanwhile
    load();
    nextTick(() => panel.value?.querySelector("textarea")?.focus());
  },
);
</script>

<template>
  <section
    ref="panel"
    class="flex min-h-0 flex-1 flex-col"
    :aria-label="t('chat_title', 'AI assistant', 'Asystent AI')"
    data-testid="ai-chat-panel"
  >
    <ChatPanelHeader
      :conversations="conversations"
      :active-id="activeId"
      :disabled="sending"
      @select="openConversation"
      @new="startNew"
      @close="emit('close')"
    />

    <div class="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <ChatMessageList
        v-if="messages.length"
        :messages="messages"
        :waiting="sending"
        class="min-h-0 flex-1"
      />
      <p
        v-else
        class="text-muted-color flex flex-1 items-center justify-center px-6 text-center"
      >
        {{
          t(
            "chat_panel_empty",
            "Ask anything - I can also fill in the form on this page for you.",
            "Zapytaj o cokolwiek - mogę też wypełnić za Ciebie formularz na tej stronie.",
          )
        }}
      </p>

      <ChatComposer
        v-model:model-key="modelKey"
        :send="send"
        :disabled="loading"
        :models="models"
      />
    </div>
  </section>
</template>
