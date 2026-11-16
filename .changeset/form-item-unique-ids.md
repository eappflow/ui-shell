---
"@eappflow/ui-shell-components": patch
---

`EafFormItem` gives its label `for` and the slot's `id` a prefix unique to the item (`useId()`), so two forms with the same field on one page no longer share an id. `data-testid` stays the field's path.
