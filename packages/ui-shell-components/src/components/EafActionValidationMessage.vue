<script setup lang="ts">
import { useEafMessageStore } from "../stores/useEafMessageStore";
import Message from "primevue/message";

const messageStore = useEafMessageStore();
</script>

<template>
  <div v-if="messageStore.validationMessage" class="mb-4">
    <Message
      :severity="messageStore.validationMessage.severity ?? 'error'"
      :closable="true"
      @close="messageStore.clearValidationMessage()"
    >
      <template #default>
        <div>
          <p class="font-medium">
            {{ messageStore.validationMessage.message }}
          </p>
          <ul
            v-if="messageStore.validationMessage.validationErrors.length > 0"
            class="mt-1 list-disc list-inside text-sm"
          >
            <li
              v-for="(err, idx) in messageStore.validationMessage
                .validationErrors"
              :key="idx"
            >
              {{ err }}
            </li>
          </ul>
        </div>
      </template>
    </Message>
  </div>
</template>
