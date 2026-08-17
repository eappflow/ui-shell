---
"@eappflow/ui-shell": patch
"@eappflow/ui-shell-components": patch
---

`required: true` in `useEafForm` now falls back to a translated message (`validation.required`), overridable via `i18nConfig.messages`.
