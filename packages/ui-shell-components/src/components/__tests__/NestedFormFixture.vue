<script setup lang="ts">
/**
 * Test fixture: a script-setup form with nested data, so both the runtime
 * (`$f` binding in a compiled SFC template) and the template types (checked
 * by vue-tsc) are covered.
 */
import { z } from "zod";
import EafFormItem from "../EafFormItem.vue";
import { useEafForm } from "../../composables/useEafForm";

const $f = useEafForm({
  defaultValues: { name: "", address: { street: "", city: "" } },
  schema: z.object({
    name: z.string(),
    // Required all the same - a null one is a missing one
    address: z
      .object({ street: z.string(), city: z.string().optional() })
      .nullable(),
  }),
});

defineExpose({ form: $f });
</script>

<template>
  <EafFormItem :field="$f.fields.name" label="Name">
    <input v-model="$f.data.name" />
  </EafFormItem>
  <EafFormItem :field="$f.fields.address.street" label="Street">
    <input v-if="$f.data.address" v-model="$f.data.address.street" />
  </EafFormItem>

  <!-- Type-level checks only, never rendered -->
  <template v-if="false">
    <!-- @vue-expect-error unknown field in $f.fields -->
    <EafFormItem :field="$f.fields.address.stret" />
    <!-- @vue-expect-error `field` is required -->
    <EafFormItem label="Name" />
  </template>
</template>
