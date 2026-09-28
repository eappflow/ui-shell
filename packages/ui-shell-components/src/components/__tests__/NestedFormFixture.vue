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
    name: { required: true },
    address: { required: true, street: { required: true } },
  },
});

defineExpose({ form: $f });
</script>

<template>
  <EafFormItem
    :field="$f.fields.name"
    label="Name"
  >
    <input v-model="$f.data.name">
  </EafFormItem>
  <EafFormItem
    :field="$f.fields.address.street"
    label="Street"
  >
    <input
      v-if="$f.data.address"
      v-model="$f.data.address.street"
    >
  </EafFormItem>

  <!-- Type-level checks only, never rendered -->
  <template v-if="false">
    <!-- @vue-expect-error unknown nested field -->
    <EafFormItem :field="$f.fields.address.stret" />
    <!-- @vue-expect-error `field` is required -->
    <EafFormItem label="Name" />
    <!-- @vue-expect-error a path string is not a field handle -->
    <EafFormItem field="name" />
  </template>
</template>
