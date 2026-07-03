import type { App } from "vue";
import EafFormItem from "./components/EafFormItem.vue";
import EafFormValidationSummary from "./components/EafFormValidationSummary.vue";
import EafActionValidationMessage from "./components/EafActionValidationMessage.vue";
import EafLogo from "./components/EafActionValidationMessage.vue";

// ─── Form Components ────────────────────────────────────────────────────────
export { default as EafFormItem } from "./components/EafFormItem.vue";
export { default as EafFormValidationSummary } from "./components/EafFormValidationSummary.vue";
export { default as EafActionValidationMessage } from "./components/EafActionValidationMessage.vue";

// ─── UI Components ────────────────────────────────────────────────────────
export { default as EafLogo } from "./components/ui/EafLogo.vue";

// ─── Stores ─────────────────────────────────────────────────────────────────
export { useEafMessageStore } from "./stores/useEafMessageStore";

// ─── Composables ────────────────────────────────────────────────────────────
export { useEafFormValidation } from "./composables/useEafFormValidation";

export default {
  install(app: App) {
    app.component("EafFormItem", EafFormItem);
    app.component("EafFormValidationSummary", EafFormValidationSummary);
    app.component("EafActionValidationMessage", EafActionValidationMessage);
    app.component("EafLogo", EafLogo);
  },
};
