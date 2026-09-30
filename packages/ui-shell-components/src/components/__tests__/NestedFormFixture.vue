<script setup lang="ts">
/**
 * Test fixture: a script-setup form with nested data, so both the runtime
 * (`$f` binding in a compiled SFC template) and the template types (checked
 * by vue-tsc) are covered.
 */
import EafFormItem from "../EafFormItem.vue";
import { useEafForm } from "../../composables/useEafForm";

interface UnitForm {
  name: string;
  address: { street: string; city: string } | null;
}

const $f = useEafForm<UnitForm>({
  data: { name: "", address: { street: "", city: "" } },
  rules: {
    name: { $required: true },
    address: { $required: true, street: { $required: true } },
  },
});

defineExpose({ form: $f });
</script>

<template>
  <EafFormItem
    :for="$f.fields.name"
    label="Name"
  >
    <input v-model="$f.data.name">
  </EafFormItem>
  <EafFormItem
    :for="$f.fields.address.street"
    label="Street"
  >
    <input
      v-if="$f.data.address"
      v-model="$f.data.address.street"
    >
  </EafFormItem>

  <!-- Type-level checks only, never rendered -->
  <template v-if="false">
    <!-- @vue-expect-error unknown field in $f.fields -->
    <EafFormItem :for="$f.fields.address.stret" />
    <!-- @vue-expect-error `for` is required -->
    <EafFormItem label="Name" />
  </template>
</template>
