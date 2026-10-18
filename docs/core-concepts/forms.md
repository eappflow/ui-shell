# Forms

`useEafForm` from `@eappflow/ui-shell-components` holds a form's values,
checks them with a [Zod](https://zod.dev) schema, and shows the errors, its
own and the API's, under the fields.

## Example

```vue
<script setup lang="ts">
import { z } from "zod";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import {
  EafFormItem,
  EafFormValidationSummary,
  useEafForm,
} from "@eappflow/ui-shell-components";

const $f = useEafForm({
  schema: z.object({
    name: z.string().min(1),
    email: z.email(),
    phone: z.string(),
  }),
  async onSubmit(values) {
    await api.saveContact(values);
  },
});
</script>

<template>
  <form @submit.prevent="$f.submit()">
    <EafFormValidationSummary :form="$f" />

    <EafFormItem v-slot="{ id }" :field="$f.fields.name" label="Name">
      <InputText :id="id" v-model="$f.data.name" />
    </EafFormItem>
    <EafFormItem v-slot="{ id }" :field="$f.fields.email" label="Email">
      <InputText :id="id" v-model="$f.data.email" />
    </EafFormItem>
    <EafFormItem v-slot="{ id }" :field="$f.fields.phone" label="Phone">
      <InputText :id="id" v-model="$f.data.phone" />
    </EafFormItem>

    <Button type="submit" label="Save" :loading="$f.loading.value" />
  </form>
</template>
```

- `$f.data` holds the values. The form starts with the schema's empty values,
  and `defaultValues` overrides them.
- `EafFormItem` shows the label and the field's errors, and marks required
  fields.
- `$f.submit()` validates, then runs `onSubmit` with the values.

## Validation

### Required fields

- `z.string()`: the field may stay empty.
- `z.string().min(1)`: the field is required. It gets a red `*`, and
  "This field is required" when left empty.

Other types (`z.number()`, `z.email()`, `z.enum()`) are required as they are.
Add `.optional()` or `.nullable()` to let them stay empty.

### When and how

- Fields are checked when focus leaves them, and on every change after that.
  Use `validateOn: "change"` or `"submit"` to change this.
- Messages come in the app's language: "required" from the shell's
  translations (`validation.required`), the rest from Zod's locales. A schema
  can give its own message, e.g. `z.string().min(1, "Enter a name")`.

## Schemas from the API

You don't have to write the schemas by hand. If your API has an OpenAPI spec,
[Orval](https://orval.dev) can generate a Zod schema for every request, so
the form checks exactly what the API takes: required fields, lengths, formats
and enums.

```ts
// orval.config.ts
import { defineConfig } from "orval";

export default defineConfig({
  schemas: {
    input: { target: "./openapi.json" },
    output: {
      client: "zod",
      target: "./src/generated/schemas.zod.ts",
    },
  },
});
```

`pnpm orval` writes a schema per operation. For an operation `createContact`,
the request body's schema is `createContactBody`:

```ts
import { createContactBody } from "../generated/schemas.zod";

const $f = useEafForm({
  schema: createContactBody,
  onSubmit: (values) => api.createContact(values),
});
```

- Orval writes Zod 4 code when your `package.json` has `zod` 4, which
  `useEafForm` needs.
- If Orval already generates your API client, keep that entry and add this one
  next to it.
- After the API changes, run `pnpm orval` again and the forms follow.
- A string the API requires is marked required in the form only with
  `minLength: 1` in the spec.
- For a field only the form has, extend the schema, e.g.
  `createContactBody.extend({ acceptTerms: z.literal(true) })`.

## API errors

The schema checks the values before they are sent, but only the server knows
some things, e.g. that the email is already taken. When `onSubmit` throws, the
form passes the error to a **parser**. The parser turns the error into errors
by field path, and the form shows them.

### Example

The contact form from the [example](#example) is submitted, and `api.saveContact`
fails with a 422 response:

```json
{
  "message": "The contact could not be saved.",
  "validationErrors": {
    "email": ["This email is already taken."],
    "phone": ["Enter a mobile number."],
    "companyId": ["Pick a company."],
    "": ["You can have at most 100 contacts."]
  }
}
```

The form shows the errors like this:

| Error            | Where it shows                                                              |
| ---------------- | --------------------------------------------------------------------------- |
| `message`        | At the top of `EafFormValidationSummary`                                    |
| `email`, `phone` | Under their fields, as `EafFormItem` shows them                             |
| `companyId`      | In the summary, as `companyId: Pick a company.`: the form has no such field |
| `""`             | In the summary: it is about the whole form                                  |

The next `submit()` clears these errors first.

### The default parser

Without your own parser, the shell uses one for Axios errors. It reads
`error.response.status` and the body above (`message`, `validationErrors`).
It handles only 400 and 422 responses. For other errors (500, no network) the
form shows nothing, and `submit()` does not throw them again. Show those
elsewhere, e.g. in a toast from an Axios interceptor.

### Your own parser

Write one when your API sends errors in another shape. The keys must match the
form's paths exactly (`email`, `address.city`, `items[0].quantity`). An
ASP.NET API, for example, sends `errors` with PascalCase keys (`Email`):

```ts
// src/services/parseApiError.ts
import axios from "axios";
import type { EafFormApiErrorParser } from "@eappflow/ui-shell-components";

// "Address.City" → "address.city"
const toPath = (key: string) =>
  key
    .split(".")
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join(".");

export const parseApiError: EafFormApiErrorParser = (error) => {
  if (!axios.isAxiosError(error) || !error.response) {
    return { status: 0, success: false, handleErrors: false };
  }
  const { status, data } = error.response;
  return {
    status,
    success: false,
    generalMessage: data.title,
    validationErrors: Object.fromEntries(
      Object.entries(data.errors ?? {}).map(([key, messages]) => [
        toPath(key),
        messages as string[],
      ]),
    ),
    handleErrors: status === 400 || status === 422,
  };
};
```

Pass it in the plugin options:

```ts
app.use(EAppFlowUIShell, {
  // ...
  services: { authService, parseApiError },
});
```

`handleErrors: false` tells the form the error is not for it to show.

### Outside `onSubmit`

When you call the API yourself, e.g. on a button that is not the submit
button, pass its error to `$f.handleApiError(error)`. It returns `false` when
the error was not one to show.

## AI chat

By default, the [AI assistant](./ai-assistant.md) can read the forms on screen
and fill them in for the user to review. Set `exposeToAi: false` to hide a
form, or pass descriptions of its fields:

```ts
useEafForm({
  schema,
  exposeToAi: {
    $description: "A new contact",
    phone: "With the country code, e.g. +48",
  },
});
```
