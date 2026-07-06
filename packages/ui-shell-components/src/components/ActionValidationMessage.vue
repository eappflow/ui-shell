<script setup lang="ts">
import { computed } from "vue";
import Message from "primevue/message";
import { useEafMessageStore } from "@/stores/useEafMessageStore";

const messageStore = useEafMessageStore();

// Computed properties from store
const message = computed(() => messageStore.validationMessage?.message || "");
const validationErrors = computed(
  () => messageStore.validationMessage?.validationErrors || [],
);
const severity = computed(
  () => messageStore.validationMessage?.severity || "error",
);

// Only show component if there's a message or validation errors
const hasContent = computed(() => {
  return message.value !== "" || validationErrors.value.length > 0;
});

const shouldDisplay = computed(() => {
  return hasContent.value && messageStore.validationMessage !== null;
});

function handleClose() {
  messageStore.clearValidationMessage();
}
</script>

<template>
  <Message
    v-if="shouldDisplay"
    :severity="severity"
    closable
    @close="handleClose"
    class="mb-4"
  >
    <div class="flex flex-col gap-2">
      <!-- General message -->
      <div v-if="message" class="font-semibold">
        {{ message }}
      </div>

      <!-- Validation errors -->
      <ul
        v-if="validationErrors.length > 0"
        class="list-disc list-inside space-y-1 mt-1"
      >
        <li
          v-for="(error, index) in validationErrors"
          :key="index"
          class="text-sm"
        >
          {{ error }}
        </li>
      </ul>
    </div>
  </Message>
</template>

<style scoped>
/* Additional styles if needed */
</style>
