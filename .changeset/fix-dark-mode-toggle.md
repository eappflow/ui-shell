---
"@eappflow/ui-shell": patch
"@eappflow/ui-shell-components": patch
"@eappflow/diagnostics": patch
---

Fix dark mode: the toggle now actually applies the dark theme (was silently disabled), the shell chrome, diagnostics panels, and Welcome page follow it correctly, and redundant PrimeVue Menu borders are removed.

Refine the account menu: it drops the nested PrimeVue Menu in favour of standalone `ThemeColorPicker` (color dots) and `LanguageSelect` components, with a transparent menu background and primary-coloured active item. The unauthorized (login) layout gains a language selector and a dark-mode-aware login card, and the sidebar/menu styles move from custom CSS to Tailwind utilities.
