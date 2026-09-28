---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": patch
---

**BREAKING:** `EafFormItem` no longer accepts the `form` + `for` props. Its only way to bind a field is the new, required `field` prop - migrate every item from `for="email" :form="$f"` to `:field="$f.fields.email"` (nested: `:field="$f.fields.address.street"`). Rendering is unchanged: `data-testid`, the label's `for` and the input's `name` are the field path, the error is under `${path}-error`. (Breaking change in 0.x, hence a minor bump.)

`useEafForm` supports nested data (`{ address: { street: string } }`):

- **Field handles**: `$f.fields.address.street` (`EafField`, with `$path`, `$required`, `$errors`, `$error`), typed from the form data. Pass them to `EafFormItem` as `:field="$f.fields.address.street"` - a typo in the path is a type error.
- **Nested rules** (`EafRules<T>`) mirror the data: `address: { required: true, street: { required: true } }`. When a sub-object is `null`/`undefined`, only its own `required` rule is checked and its children are skipped. `RulesForFormData` is now a deprecated alias of `EafRules`.
- **Errors are keyed by dot path** (`address.street`), both from `validate()` and from API errors (`items.0.name` resolves through arrays). API errors on paths that don't exist in the data still go to the summary.
- **`resetForm()` restores nested data** from a deep copy taken when the form was created. Each reset uses a fresh copy.
- `isFieldRequired()` accepts dot paths.
- **`mapErrorPath`** (optional, per call): `submit(handler, { mapErrorPath })` and `handleApiError(error, { mapErrorPath })` map every API error key to a form data path before matching, for when the request shape differs from the form data (e.g. an update sends `{ baseInfo: { name } }` for a form holding `{ name }`: `mapErrorPath: (p) => p.replace(/^baseInfo\./, "")`). Keys that still match no field go to the summary under the mapped path. New exported types: `EafSubmitOptions`, `EafApiErrorOptions`.
- **`showInSummary`** (optional, per call, next to `mapErrorPath`): `submit(handler, { showInSummary: (p) => p.startsWith("data.") })` sends errors whose (mapped) path matches to the summary as `path: message`, even when the path exists in the data - for data no `EafFormItem` displays (e.g. a key/value map edited by a custom component), whose errors would otherwise be shown nowhere.

The login and password views use `:field`.
