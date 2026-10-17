<script setup lang="ts">
import { computed } from "vue";
import type { AiChatMessage } from "../../types";
import { useScopedI18n } from "../../composables/useScopedI18n";
import { useMessageLinks } from "../../composables/useMessageLinks";
import { renderMarkdown } from "../../utils/renderMarkdown";

const props = defineProps<{ message: AiChatMessage }>();

const { locale } = useScopedI18n();
const { followLink } = useMessageLinks();

const isUser = computed(() => props.message.role === "User");
const html = computed(() => renderMarkdown(props.message.content));

// Just the time for today's messages, the date as well for older ones.
const sentAt = computed(() => {
  const date = new Date(props.message.sentAt);
  const isToday = date.toDateString() === new Date().toDateString();
  return date.toLocaleString(
    locale.value,
    isToday
      ? { timeStyle: "short" }
      : { dateStyle: "short", timeStyle: "short" },
  );
});
</script>

<template>
  <div
    class="flex max-w-[85%] flex-col gap-1"
    :class="isUser ? 'items-end self-end' : 'items-start self-start'"
  >
    <div
      v-if="isUser"
      class="bg-primary text-primary-contrast rounded-lg px-4 py-2 whitespace-pre-wrap"
    >
      {{ message.content }}
    </div>
    <!-- eslint-disable vue/no-v-html -- sanitized by DOMPurify -->
    <div
      v-else
      class="bg-emphasis space-y-2 rounded-lg px-4 py-2 [&_a]:font-medium [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5"
      @click="followLink"
      v-html="html"
    />
    <!-- eslint-enable vue/no-v-html -->
    <span class="text-muted-color text-xs">{{ sentAt }}</span>
  </div>
</template>
