<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import type { AiConversation } from "../../types";
import { useScopedI18n } from "../../composables/useScopedI18n";

defineProps<{
  conversations: AiConversation[];
  activeId: string | null;
  disabled: boolean;
}>();
const emit = defineEmits<{
  select: [id: string];
  new: [];
  close: [];
}>();

const { t } = useScopedI18n();

// As wide as the conversation's title (PrimeVue's label takes the space it's given, at width 1%),
// shrinking with an ellipsis when that's too long - and long titles cut in the list too.
const selectPt = {
  label: { class: "w-auto! flex-initial! font-medium" },
  overlay: { class: "max-w-[24rem]" },
  optionLabel: { class: "truncate" },
};
</script>

<template>
  <header
    class="border-eaf-card-border flex h-14 shrink-0 items-center gap-1 border-b px-3"
  >
    <Select
      :model-value="activeId"
      :options="conversations"
      option-label="title"
      option-value="id"
      :placeholder="t('chat_new', 'New conversation', 'Nowa rozmowa')"
      :aria-label="t('chat_conversation', 'Conversation', 'Rozmowa')"
      :disabled="disabled"
      size="small"
      class="hover:bg-emphasis! min-w-0 border-0! bg-transparent! shadow-none!"
      :pt="selectPt"
      data-testid="ai-chat-conversation-select"
      @update:model-value="emit('select', $event)"
    />
    <Button
      class="ml-auto"
      icon="pi pi-plus"
      text
      rounded
      size="small"
      :aria-label="t('chat_new', 'New conversation', 'Nowa rozmowa')"
      :disabled="disabled"
      @click="emit('new')"
    />
    <Button
      icon="pi pi-times"
      text
      rounded
      size="small"
      :aria-label="t('chat_close', 'Close', 'Zamknij')"
      data-testid="ai-chat-close-button"
      @click="emit('close')"
    />
  </header>
</template>
