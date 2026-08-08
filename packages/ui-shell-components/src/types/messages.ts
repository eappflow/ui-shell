/**
 * Toast message for PrimeVue Toast component
 */
export interface ToastMessage {
  severity: "success" | "info" | "warn" | "error";
  summary: string;
  detail: string;
  life?: number;
}

/**
 * Validation message for form/action validation errors
 */
export interface ValidationMessage {
  generalMessage: string;
  validationErrors: Map<string, string[]>;
  severity?: "error" | "warn" | "info" | "success";
}
