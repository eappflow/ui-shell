---
"@eappflow/ui-shell-components": minor
"@eappflow/ui-shell": minor
---

**BREAKING:** `useEafForm` validates with a zod `schema` (zod 4 peer dependency) instead of `rules`, and takes its type from it. `data` → `defaultValues`, `$f.submit(handler)` → `onSubmit` in the config and `$f.submit()`, `validateOnChange` → `validateOn` (`"blur"` by default). Breaking in 0.x, hence a minor bump.
