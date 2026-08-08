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
            {{ messageStore.validationMessage.generalMessage }}
          </p>
          <ul
            v-if="messageStore.validationMessage.validationErrors.size > 0"
            class="mt-1 list-disc list-inside text-sm"
          >
            <li
              v-for="[field, messages] in messageStore.validationMessage
                .validationErrors"
              :key="field"
            >
              <strong>{{ field }}:</strong>
              <ul
                v-if="messages && messages.length > 0"
                class="list-disc list-inside space-y-1 mt-1 ml-4"
              >
                <li
                  v-for="(error, index) in messages"
                  :key="index"
                  class="text-sm"
                >
                  {{ error }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </template>
    </Message>
  </div>
</template>
