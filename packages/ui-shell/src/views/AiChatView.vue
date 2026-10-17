<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import AppAside from "../components/AppAside.vue";
import ChatComposer from "../components/chat/ChatComposer.vue";
import ChatConversationList from "../components/chat/ChatConversationList.vue";
import ChatMessageList from "../components/chat/ChatMessageList.vue";
import { useEafChat } from "@eappflow/ui-shell-components";
import { useScopedI18n } from "../composables/useScopedI18n";
import { useLayoutStore } from "../stores/useLayoutStore";

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
  open,
  startNew,
  send,
  rename,
  remove,
} = useEafChat();
const layoutStore = useLayoutStore();

onMounted(() => {
  layoutStore.chatPageOpen = true;
  load();
});
onUnmounted(() => (layoutStore.chatPageOpen = false));
</script>

<template>
  <!-- The layout's router-view puts "flex flex-col" on a view's root element, so the two columns
       get their own container - otherwise the history would stack above the chat.
       Its negative margin undoes the layout's content padding (p-1 md:p-5): the history runs from
       the header to the bottom, by the sidebar, and the chat takes the padding on instead. -->
  <div class="-m-1 md:-m-5">
    <div class="flex items-start">
      <!-- Stays put while the page scrolls the messages, as tall as the screen less the header (3.5rem) -->
      <AppAside
        side="left"
        :open="true"
        class="sticky top-0 h-[calc(100dvh-3.5rem)] min-h-96 shrink-0"
      >
        <ChatConversationList
          class="min-h-0 flex-1"
          :conversations="conversations"
          :active-id="activeId"
          :disabled="sending"
          @select="open"
          @new="startNew"
          @rename="rename"
          @remove="remove"
        />
      </AppAside>

      <!-- A new chat starts with the input alone in the middle; once there are messages it sits below them. -->
      <section
        class="flex min-h-[calc(100dvh-3.5rem)] min-w-0 flex-1 flex-col gap-4 p-1 md:p-5"
        :class="{ 'justify-center': !messages.length }"
      >
        <ChatMessageList
          v-if="messages.length"
          :messages="messages"
          :waiting="sending"
          class="flex-1"
        />
        <p v-else class="text-muted-color text-center text-xl">
          {{
            t(
              "chat_empty",
              "Ask anything to start the conversation.",
              "Zadaj pytanie, aby rozpocząć rozmowę.",
            )
          }}
        </p>

        <!-- Stuck to the bottom of the screen, over the section's bottom padding, on the layout's
             background - so the messages scroll away under it. -->
        <div
          class="sticky bottom-0 -mb-1 bg-surface-50 pb-1 md:-mb-5 md:pb-5 dark:bg-surface-950"
        >
          <ChatComposer
            v-model:model-key="modelKey"
            :send="send"
            :disabled="loading"
            :models="models"
            class="mx-auto w-full max-w-3xl"
          />
        </div>
      </section>
    </div>
  </div>
</template>
