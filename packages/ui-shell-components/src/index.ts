import type { App } from "vue";
import "./style/index.css";
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
export { useEafAiTool, eafScreenTools } from "./composables/useEafAiTool.js";
export { defineEafAiTool } from "./ai-tools/defineEafAiTool";
export {
  useEafChat,
  AI_CHAT_SERVICE_KEY,
  AI_CHAT_TOOLS_KEY,
} from "./composables/useEafChat.js";

// ─── Types ──────────────────────────────────────────────────────────────────
export type {
  EafForm,
  EafFormConfig,
  EafFormApiErrorParser,
  ApiParsedErrorResponse,
  EafField,
  EafFields,
  EafAiDescriptions,
  EafAiTool,
  AiChatService,
  AiConversation,
  AiModel,
  AiChatMessage,
  AiClientTool,
  AiToolCall,
  AiToolResult,
  AiChatReply,
} from "./types";

export default {
  install(app: App) {
    app.component("EafFormItem", EafFormItem);
    app.component("EafFormValidationSummary", EafFormValidationSummary);
    app.component("EafActionValidationMessage", EafActionValidationMessage);
  },
};
