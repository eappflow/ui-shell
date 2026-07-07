import { defineStore } from "pinia";
import { ref } from "vue";
import type { ToastMessage, ValidationMessage } from "../types";

export const useEafMessageStore = defineStore("eafMessage", () => {
  const messages = ref<ToastMessage[]>([]);
  const validationMessage = ref<ValidationMessage | null>(null);

  function addMessage(message: ToastMessage) {
    messages.value.push(message);
  }

  function clearMessages() {
    messages.value = [];
  }

  function setValidationMessage(
    message: string,
    validationErrors: string[] = [],
    severity: "error" | "warn" | "info" | "success" = "error",
  ) {
    validationMessage.value = { message, validationErrors, severity };
  }

  function clearValidationMessage() {
    validationMessage.value = null;
  }

  return {
    messages,
    addMessage,
    clearMessages,
    validationMessage,
    setValidationMessage,
    clearValidationMessage,
  };
});
