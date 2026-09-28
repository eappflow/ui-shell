---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": patch
---

**BREAKING:** `EafFormItem` drops the `form` + `for` props - bind with the required `field` handle instead: `for="email" :form="$f"` → `:field="$f.fields.email"` (nested: `:field="$f.fields.address.street"`). Rendering is unchanged: `data-testid`, the label's `for` and the input's `name` are the field path, the error is under `${path}-error`. Breaking in 0.x, hence a minor bump.

`useEafForm` supports nested data (`{ address: { street: string } }`):

- **Field handles** typed from the data: `$f.fields.address.street` (`EafField` with `$path`, `$required`, `$errors`, `$error`) - a typo in the path is a type error.
- **Nested rules** (`EafRules<T>`) mirror the data: `address: { required: true, street: { required: true } }`. A `null`/`undefined` sub-object only checks its own `required`; its children are skipped. `RulesForFormData` is now a deprecated alias.
- **Errors keyed by dot path** (`address.street`), from `validate()` and from API errors (`items.0.name`). Errors on paths not in the data go to the summary.
- **`resetForm()` restores nested data** from a deep copy taken at creation.
- **`mapErrorPath`** maps API error keys to form data paths before matching (`baseInfo.name` → `name`); **`showInSummary`** sends matching (mapped) paths to the summary even when they exist in the data. New types: `EafSubmitOptions`, `EafApiErrorOptions`.

The login and password views use `:field`.
