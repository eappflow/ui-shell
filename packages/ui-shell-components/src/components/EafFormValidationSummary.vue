<script setup lang="ts">
import { computed, unref } from "vue";
import Message from "primevue/message";
import { EafFormValidation } from "@/types/api-error";

interface Props {
  form?: EafFormValidation;
  severity?: "error" | "warn" | "info" | "success";
  // Deprecated: for backward compatibility
  generalMessage?: string;
  summaryErrors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  form: undefined,
  severity: "error",
  generalMessage: "",
  summaryErrors: () => [],
});

// Support both new form object and old individual props pattern
const message = computed(() => {
  const formMessage = props.form?.generalMessage
    ? unref(props.form.generalMessage)
    : "";
  return formMessage || props.generalMessage || "";
});

const errors = computed(() => {
  const formErrors = props.form?.summaryErrors
    ? unref(props.form.summaryErrors)
    : [];
  return formErrors.length > 0 ? formErrors : props.summaryErrors || [];
});

// Only show component if there's a message or summary errors
const hasContent = computed(() => {
  return message.value !== "" || errors.value.length > 0;
});
</script>

<template>
  <Message
    v-if="hasContent"
    data-testid="form-validation-summary"
    :severity="severity"
    :closable="false"
    class="mb-4"
  >
    <div class="flex flex-col gap-2">
      <!-- General message -->
      <div v-if="message" class="font-semibold">
        {{ message }}
      </div>

      <!-- Summary errors (unmapped validation errors) -->
      <ul
        v-if="errors && errors.length > 0"
        class="list-disc list-inside space-y-1 mt-1"
      >
        <li v-for="(error, index) in errors" :key="index" class="text-sm">
          {{ error }}
        </li>
      </ul>
    </div>
  </Message>
</template>

<style scoped>
/* Additional styles if needed */
</style>
