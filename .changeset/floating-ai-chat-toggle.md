---
"@eappflow/ui-shell": minor
---

Chat panel state lives in `useLayoutStore` (`chatPanelOpen`, `toggleChatPanel`). The "Ask AI" button is now a floating button above dialogs, so `AppHeader` no longer has the `aiChat` prop.
