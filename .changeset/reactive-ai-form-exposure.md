---
"@eappflow/ui-shell-components": patch
---

Add reactive AI form exposure control.

- Support `MaybeRefOrGetter` for `exposeToAi` configuration.
- Automatically register and unregister forms from AI exposure when the option changes.
- Clean up AI form exposure when the owning component is unmounted.
