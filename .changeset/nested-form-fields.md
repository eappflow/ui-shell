---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": patch
---

**BREAKING:** `EafFormItem` drops the `form` prop - pass a field from `$f.fields` instead: `for="email" :form="$f"` → `:field="$f.fields.email"`. A typo in it is a type error. A field's state lives on the field: `$f.fields.email.$error` / `$errors` / `$required` / `$setError(msg)` / `$clearError()` replace the form's `getFieldError`, `getAllFieldErrors`, `hasFieldError`, `isFieldRequired`, `setFieldError` and `clearFieldError` (for a path known only at runtime use `$f.fieldErrors`). `showAllErrors` is gone - `EafFormItem` shows the field's first error. Rule keys get a `$` too, so they never clash with data fields: `required`/`length`/`pattern`/`range` → `$required`/`$length`/`$pattern`/`$range` (a field named `required` or `length` can now have rules at any depth). Breaking in 0.x, hence a minor bump.

`useEafForm` supports nested data (`{ address: { street: string } }`):

- **`$f.fields`** mirrors the data with LSP completion at every level, array indexes included: `:field="$f.fields.users[2].email"` (`EafFields<T>`, `EafField`). `data-testid` and the label's `for` are the path (`"users[2].email"`), the error - now a PrimeVue `Message` (`severity="error" size="small" variant="simple"`) instead of a red `<small>` - is under `${path}-error`; the slot gets the path as `id` for the input (`v-slot="{ id }"` → `:id="id"`, replacing the slot's `field`) and `EafFormItem` no longer sets `name` on it; while there's an error, PrimeVue inputs anywhere inside turn invalid - wrapped ones too, e.g. in an `IconField`, and `Password`, `DatePicker`, `InputNumber` - through an injected `$pcFormField`, as under PrimeVue Forms' `FormField`; no `p-invalid` class is added by `EafFormItem` any more.
- **Nested rules** (`EafRules<T>`) mirror the data: `address: { $required: true, street: { $required: true } }`. Array items get rules through `$each`: `addresses: { $each: { street: { $required: true } } }` (errors under `addresses[0].street`, like the API's), `tags: { $each: { $length: {...} } }`. On an array `$length` counts its items: `addresses: { $length: { minLength: 1, message } }`. `$pattern` skips an empty value - requiring one is `$required`'s job. A `null`/`undefined` sub-object only checks its own `$required`; its children are skipped.
- **Errors keyed by field path** (`address.street`, `items[0].name` - the API's format), from `validate()` and from API errors. Errors on paths not in the data go to the summary.
- **Rules are checked when a value changes**, field by field: changing a field sets or clears its errors (an API error on it too); untouched fields wait for `validate()`/`submit()`. Watchers follow the data, so added array items and sub-objects set later are covered; a removed item's errors are cleared. Data restored by `resetForm()` isn't validated. Turn it off with `useEafForm({ ..., validateOnChange: false })`.
- **`resetForm()` restores nested data** from a deep copy taken at creation; `resetForm(data)` puts the given data in instead (e.g. a loaded record), clearing errors without validating it.
- New types: `EafField`, `EafFields`, `EafRules`.

The `primevue` peer range is now `^4.2.0` (still below 5): the error `Message` uses `size`/`variant`, added in 4.2.0.

The login and password views use `$f.fields` and take `$required` from their rules.
