---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": patch
---

**BREAKING:** `EafFormItem` drops the `form` prop - pass a field from `$f.fields` instead: `for="email" :form="$f"` → `:field="$f.fields.email"`. A typo in it is a type error. A field's state lives on the field: `$f.fields.email.$error` / `$errors` / `$required` / `$setError(msg)` / `$clearError()` replace the form's `getFieldError`, `getAllFieldErrors`, `hasFieldError`, `isFieldRequired`, `setFieldError` and `clearFieldError` (for a path known only at runtime use `$f.fieldErrors`). `showAllErrors` is gone - `EafFormItem` shows the field's first error. Breaking in 0.x, hence a minor bump.

`useEafForm` supports nested data (`{ address: { street: string } }`):

- **`$f.fields`** mirrors the data with LSP completion at every level, array indexes included: `:field="$f.fields.users[2].email"` (`EafFields<T>`, `EafField`). `data-testid` and the label's `for` are the path (`"users[2].email"`), the error - now a PrimeVue `Message` (`severity="error" size="small" variant="simple"`) instead of a red `<small>` - is under `${path}-error`; the slot gets the path as `id` for the input (`v-slot="{ id }"` → `:id="id"`, replacing the slot's `field`) and `EafFormItem` no longer sets `name` on it; while there's an error, PrimeVue inputs anywhere inside turn invalid - wrapped ones too, e.g. in an `IconField`, and `Password`, `DatePicker`, `InputNumber` - through an injected `$pcFormField`, as under PrimeVue Forms' `FormField`; no `p-invalid` class is added by `EafFormItem` any more.
- **Errors keyed by field path** (`address.street`, `items[0].name` - the API's format), from `validate()` and from API errors. Errors on paths not in the data go to the summary.
- **`resetForm()` restores nested data** from a deep copy taken at creation; `resetForm(data)` puts the given data in instead (e.g. a loaded record), clearing errors without validating it.
- New types: `EafField`, `EafFields`.

The `primevue` peer range is now `^4.2.0` (still below 5): the error `Message` uses `size`/`variant`, added in 4.2.0.

The login and password views use `$f.fields`.
