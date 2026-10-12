<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import {
  EafFormItem,
  EafFormValidationSummary,
  useEafForm,
  type useEafChat,
} from "@eappflow/ui-shell-components";
import type { AiModel } from "../../types";
import { useScopedI18n } from "../../composables/useScopedI18n";

const props = defineProps<{
  /** Awaited inside $f.submit, so the API's errors for the message show up under the field */
  send: ReturnType<typeof useEafChat>["send"];
  /** The picker shows when there are any */
  models?: AiModel[];
}>();
const modelKey = defineModel<string | null>("modelKey", { default: null });

const { t } = useScopedI18n();

// Not a form for the AI to fill. Empty messages can't be sent, and the length
// limit is left to the server - $f.submit shows its error under the field.
const $f = useEafForm({
  defaultValues: { message: "" },
  exposeToAi: false,
  async onSubmit({ message }) {
    $f.data.message = "";
    try {
      await props.send(message.trim());
    } catch (error) {
      // Give the message back so it can be resent.
      $f.data.message = message;
      throw error;
    }
  },
});

function sendMessage() {
  if ($f.loading.value || !$f.data.message.trim()) return;
  $f.submit();
}
</script>

<template>
  <form @submit.prevent="sendMessage">
    <!-- Errors not about the message, e.g. the service's being down -->
    <EafFormValidationSummary :form="$f" />
    <EafFormItem v-slot="{ id }" :field="$f.fields.message">
      <!-- A rounded bubble: the text (one row to start with), then send on the right. -->
      <div
        class="bg-eaf-card flex flex-col gap-1 rounded-2xl border px-4 pt-3 pb-2 shadow-sm transition-colors"
        :class="
          $f.fields.message.$error
            ? 'border-red-500'
            : 'border-surface-300 dark:border-surface-600 focus-within:border-primary'
        "
      >
        <Textarea
          :id="id"
          v-model="$f.data.message"
          auto-resize
          rows="1"
          fluid
          class="max-h-60 resize-none border-0! bg-transparent! p-0! shadow-none! outline-none!"
          :placeholder="
            t('chat_placeholder', 'Type a message…', 'Napisz wiadomość…')
          "
          @keydown.enter.exact.prevent="sendMessage"
        />
        <div class="flex items-center gap-2">
          <!-- As wide as the model's name, as the header's conversation picker -->
          <Select
            v-if="models?.length"
            v-model="modelKey"
            :options="models"
            option-label="modelName"
            option-value="modelKey"
            :aria-label="t('chat_model', 'Model', 'Model')"
            :disabled="$f.loading.value"
            size="small"
            class="hover:bg-emphasis! -ml-2 min-w-0 border-0! bg-transparent! shadow-none!"
            :pt="{
              label: { class: 'w-auto! flex-initial!' },
              overlay: { class: 'max-w-[20rem]' },
              // Flips to point up while the list is open
              dropdownIcon: {
                class: 'transition-transform in-[.p-select-open]:rotate-x-180',
              },
            }"
            data-testid="ai-chat-model-select"
          >
            <template #option="{ option }">
              <div class="flex flex-col">
                <span>{{ option.modelName }}</span>
                <small v-if="option.description" class="text-muted-color">
                  {{ option.description }}
                </small>
              </div>
            </template>
          </Select>
          <Button
            type="submit"
            icon="pi pi-arrow-up"
            rounded
            size="small"
            class="-mr-2 ml-auto size-8! shrink-0"
            :aria-label="t('chat_send', 'Send', 'Wyślij')"
            :loading="$f.loading.value"
            :disabled="!$f.data.message.trim()"
            data-testid="ai-chat-send-button"
          />
        </div>
      </div>
    </EafFormItem>
  </form>
</template>
