import type { Ref, Reactive } from "vue";

/**
 * API Error Response structure for 422 validation errors
 * Matches the actual API response format
 */
export interface ApiErrorResponse {
  success: boolean;
  code: string;
  message: string;
  traceId: string;
  validationErrors?: Record<string, string[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

/**
 * Validation state for form components
 */
export interface ValidationState {
  fieldErrors: Map<string, string[]>;
  summaryErrors: string[];
  generalMessage: string;
}

/**
 * Configuration options for useEafFormValidation composable
 */
export interface EafValidationConfig {
  /**
   * List of field names that are registered in the form
   * Used to determine which validation errors are mapped to fields vs. summary
   */
  registeredFields?: string[];

  /**
   * Whether to show all error messages per field (true) or just the first (false)
   * Default: false
   */
  showAllErrors?: boolean;
}

/**
 * Form validation object returned by useEafFormValidation composable
 */
export interface EafFormValidation {
  fieldErrors: Reactive<Map<string, string[]>>;
  summaryErrors: Ref<string[]>;
  generalMessage: Ref<string>;
  handleApiError: (error: unknown) => boolean;
  setFieldError: (fieldName: string, messages: string | string[]) => void;
  getFieldError: (fieldName: string) => string | string[] | undefined;
  getAllFieldErrors: (fieldName: string) => string[];
  hasFieldError: (fieldName: string) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  hasErrors: () => boolean;
  registerField: (fieldName: string) => void;
  unregisterField: (fieldName: string) => void;
}
