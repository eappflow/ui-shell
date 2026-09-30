<script setup lang="ts">
import { useAuthStore } from "@eappflow/ui-shell";
import {
  EafFormItem,
  EafFormValidationSummary,
  useEafForm,
} from "@eappflow/ui-shell-components";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";

const auth = useAuthStore();
const toast = useToast();

const stats = [
  { label: "Users", value: "1,234" },
  { label: "Revenue", value: "$45,678" },
  { label: "Orders", value: "567" },
];

interface Address {
  street: string;
  city: string;
  zipCode: string;
}

// Nested form example: an object (`company`) and a list of objects
// (`addresses`, rules per item via `$each`)
const $f = useEafForm<{
  name: string;
  company: { name: string; taxId: string };
  addresses: Address[];
}>({
  data: {
    name: "",
    company: { name: "", taxId: "" },
    addresses: [{ street: "", city: "", zipCode: "" }],
  },
  rules: {
    name: { $required: true },
    company: {
      name: { $required: true },
      taxId: {
        $pattern: { regex: /^\d{10}$/, message: "Tax ID has 10 digits" },
      },
    },
    addresses: {
      $length: { minLength: 1, message: "Add at least one address" },
      $each: {
        street: { $required: true },
        city: { $required: true },
        zipCode: {
          $pattern: { regex: /^\d{2}-\d{3}$/, message: "Format: 00-000" },
        },
      },
    },
  },
});

async function save(): Promise<void> {
  await $f.submit(async () => {
    toast.add({ severity: "success", summary: "Saved", life: 3000 });
  });
}
</script>

<template>
  <div
    class="space-y-6"
    data-testid="dashboard-page"
  >
    <!-- Welcome -->
    <div>
      <h1
        class="text-3xl font-bold text-surface-900 dark:text-surface-100"
        data-testid="dashboard-welcome-heading"
      >
        Welcome, {{ auth.userName || "User" }}
      </h1>
      <p class="text-surface-600 dark:text-surface-400 mt-2">
        This is the demo application for the eAppFlow UI Shell.
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        v-for="stat in stats"
        :key="stat.label"
      >
        <template #title>
          {{ stat.label }}
        </template>
        <template #content>
          <p class="text-2xl font-bold">
            {{ stat.value }}
          </p>
        </template>
      </Card>
    </div>

    <!-- Nested form example -->
    <Card data-testid="nested-form">
      <template #title>
        Nested form
      </template>
      <template #content>
        <form
          class="flex flex-col gap-4"
          @submit.prevent="save"
        >
          <EafFormValidationSummary :form="$f" />

          <EafFormItem
            v-slot="{ id }"
            :for="$f.fields.name"
            label="Name"
          >
            <InputText
              :id="id"
              v-model="$f.data.name"
            />
          </EafFormItem>

          <h3 class="font-semibold">
            Company
          </h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EafFormItem
              v-slot="{ id }"
              :for="$f.fields.company.name"
              label="Company name"
            >
              <InputText
                :id="id"
                v-model="$f.data.company.name"
              />
            </EafFormItem>
            <EafFormItem
              v-slot="{ id }"
              :for="$f.fields.company.taxId"
              label="Tax ID"
            >
              <InputText
                :id="id"
                v-model="$f.data.company.taxId"
              />
            </EafFormItem>
          </div>

          <!-- The list's own error (item count) shows under it -->
          <EafFormItem
            :for="$f.fields.addresses"
            label="Addresses"
            label-class="font-semibold"
          >
            <div
              v-for="(address, index) in $f.data.addresses"
              :key="index"
              class="grid grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_1fr_8rem_auto]"
            >
              <EafFormItem
                v-slot="{ id }"
                :for="$f.fields.addresses[index].street"
                label="Street"
              >
                <InputText
                  :id="id"
                  v-model="address.street"
                />
              </EafFormItem>
              <EafFormItem
                v-slot="{ id }"
                :for="$f.fields.addresses[index].city"
                label="City"
              >
                <InputText
                  :id="id"
                  v-model="address.city"
                />
              </EafFormItem>
              <EafFormItem
                v-slot="{ id }"
                :for="$f.fields.addresses[index].zipCode"
                label="Zip code"
              >
                <InputText
                  :id="id"
                  v-model="address.zipCode"
                />
              </EafFormItem>
              <Button
                icon="pi pi-trash"
                severity="secondary"
                text
                aria-label="Remove address"
                class="sm:mt-7"
                @click="$f.data.addresses.splice(index, 1)"
              />
            </div>
            <Button
              label="Add address"
              icon="pi pi-plus"
              severity="secondary"
              class="self-start"
              @click="$f.data.addresses.push({ street: '', city: '', zipCode: '' })"
            />
          </EafFormItem>

          <div class="flex gap-2">
            <Button
              type="submit"
              label="Save"
              :loading="$f.loading.value"
            />
            <Button
              label="Reset"
              severity="secondary"
              @click="$f.resetForm()"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
