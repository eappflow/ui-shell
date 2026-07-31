import type { App } from "vue";
import EafFormItem from "./components/EafFormItem.vue";
import EafFormValidationSummary from "./components/EafFormValidationSummary.vue";
import EafActionValidationMessage from "./components/EafActionValidationMessage.vue";

// ─── Form Components ────────────────────────────────────────────────────────
export { default as EafFormItem } from "./components/EafFormItem.vue";
export { default as EafFormValidationSummary } from "./components/EafFormValidationSummary.vue";
export { default as EafActionValidationMessage } from "./components/EafActionValidationMessage.vue";

// ─── Stores ─────────────────────────────────────────────────────────────────
export { useEafMessageStore } from "./stores/useEafMessageStore";

// ─── Composables ────────────────────────────────────────────────────────────
export { useEafForm, EAF_FORM_KEY } from "./composables/useEafForm.js";
export { useActionValidation } from "./composables/useActionValidation.js";

// ─── Types ──────────────────────────────────────────────────────────────────
export type {
  EafFormApiErrorParser,
  ApiParsedErrorResponse,
} from "./types";

export default {
  install(app: App) {
    app.component("EafFormItem", EafFormItem);
    app.component("EafFormValidationSummary", EafFormValidationSummary);
    app.component("EafActionValidationMessage", EafActionValidationMessage);
  },
};
