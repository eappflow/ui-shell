---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": minor
---

**BREAKING:** `useEafForm` validates with a zod `schema` (zod 4 peer dependency) instead of `rules`, and takes its type from it. `data` → `defaultValues`, `$f.submit(handler)` → `onSubmit` in the config and `$f.submit()`, `validateOnChange` → `validateOn` (`"blur"` by default). Breaking in 0.x, hence a minor bump. A field is required when its schema takes no empty value (`z.string().min(1)`, `z.number()`), `defaultValues` is optional - the form starts from the schema's empty values - and `onSubmit` gets empty values as `null` or left out, as the schema takes them, so an API's generated schema (e.g. orval's zod) fits as it is. `EafFormValidationSummary` also shows the errors of fields no `EafFormItem` shows, and zod's messages follow vue-i18n's language (English or Polish).
