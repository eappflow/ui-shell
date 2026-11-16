<script setup lang="ts">
import {
  EafFormItem,
  EafFormValidationSummary,
  useEafForm,
} from "@eappflow/ui-shell-components";
import { watch } from "vue";
import { z } from "zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const visible = defineModel<boolean>("visible", { required: true });

const confirm = useConfirm();
const toast = useToast();

// The contact as an API would return it
const contact = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  note: null,
};

const $f = useEafForm({
  schema: z.object({
    name: z.string().min(1),
    email: z.email(),
    note: z.string().nullable(),
  }),
  // The AI chat sees the form only while the dialog is open
  exposeToAi: visible,
  onSubmit() {
    toast.add({ severity: "success", summary: "Saved", life: 3000 });
    visible.value = false;
  },
});

// Each opening starts from the loaded contact, so the form is not dirty
watch(visible, (open) => {
  if (open) $f.resetForm(contact);
});

/** Closes the dialog - with unsaved changes, only once the user confirms */
function close(): void {
  if (!$f.isDirty.value) {
    visible.value = false;
    return;
  }
  confirm.require({
    header: "Unsaved changes",
    message: "Close the dialog and lose your changes?",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Keep editing",
      severity: "secondary",
      outlined: true,
      "data-testid": "keep-editing-button",
    },
    acceptProps: {
      label: "Discard",
      severity: "danger",
      "data-testid": "discard-button",
    },
    accept: () => {
      visible.value = false;
    },
  });
}
</script>

<template>
  <!-- X and Escape ask `close()` instead of closing right away -->
  <Dialog
    :visible="visible"
    header="Edit contact"
    modal
    class="w-full max-w-lg"
    data-testid="edit-contact-dialog"
    @update:visible="close"
  >
    <form
      id="edit-contact-form"
      class="flex flex-col gap-4"
      @submit.prevent="$f.submit()"
    >
      <EafFormValidationSummary :form="$f" />

      <EafFormItem v-slot="{ id }" :field="$f.fields.name" label="Name">
        <InputText :id="id" v-model="$f.data.name" />
      </EafFormItem>
      <EafFormItem v-slot="{ id }" :field="$f.fields.email" label="Email">
        <InputText :id="id" v-model="$f.data.email" />
      </EafFormItem>
      <EafFormItem v-slot="{ id }" :field="$f.fields.note" label="Note">
        <Textarea :id="id" v-model="$f.data.note" rows="3" />
      </EafFormItem>
    </form>

    <template #footer>
      <span
        v-if="$f.isDirty.value"
        class="text-surface-500 mr-auto text-sm"
        data-testid="unsaved-changes"
      >
        Unsaved changes
      </span>
      <Button
        label="Cancel"
        severity="secondary"
        text
        data-testid="cancel-button"
        @click="close"
      />
      <Button
        type="submit"
        form="edit-contact-form"
        label="Save"
        data-testid="save-button"
        :disabled="!$f.isDirty.value"
        :loading="$f.loading.value"
      />
    </template>
  </Dialog>
</template>
