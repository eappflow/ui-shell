<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import type { AiChatMessage } from "../../types";
import { useScopedI18n } from "../../composables/useScopedI18n";
import ChatMessage from "./ChatMessage.vue";

const props = defineProps<{
  messages: AiChatMessage[];
  /** Shows a pulsing dot where the model's reply will appear */
  waiting: boolean;
}>();

const { t } = useScopedI18n();
const list = useTemplateRef<HTMLElement>("list");

/** Scrolls whatever scrolls the list - itself in the chat bubble, the page in the chat view - to the end */
function scrollToEnd(): void {
  for (let el = list.value; el; el = el.parentElement) {
    if (
      el.scrollHeight > el.clientHeight &&
      /auto|scroll/.test(getComputedStyle(el).overflowY)
    ) {
      el.scrollTo({ top: el.scrollHeight });
      return;
    }
  }
}

// Opening a conversation, a new message and the waiting dot all keep the newest message in view.
watch(
  [() => props.messages, () => props.messages.length, () => props.waiting],
  () => nextTick(scrollToEnd),
  { immediate: true },
);
</script>

<template>
  <div ref="list" class="flex flex-col gap-3 overflow-y-auto">
    <ChatMessage v-for="(m, i) in messages" :key="i" :message="m" />
    <span
      v-if="waiting"
      role="status"
      :aria-label="
        t('chat_thinking', 'Waiting for the reply', 'Czekam na odpowiedź')
      "
      class="motion-safe:animate-eaf-chat-thinking bg-primary ms-1 mt-1 size-3 shrink-0 self-start rounded-full"
    />
  </div>
</template>
