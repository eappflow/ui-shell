---
"@eappflow/ui-shell": minor
"@eappflow/ui-shell-components": minor
"@eappflow/diagnostics": minor
---

**BREAKING:** `./style` is no longer compiled CSS but a stylesheet for the host's own Tailwind build - its `@source` (the package's `dist`), theme tokens and the components' own CSS. Packages compiled separately and appended one after another let a plain class of one override a variant of another (`hidden` beating `md:block` hid the sidebar). Import it after Tailwind, PrimeUI and PrimeIcons, and declare the dark variant:

```css
@import "tailwindcss";
@import "tailwindcss-primeui";
@import "primeicons/primeicons.css";
@custom-variant dark (&:is(.dark, .dark *));
@import "@eappflow/ui-shell/style";
```
