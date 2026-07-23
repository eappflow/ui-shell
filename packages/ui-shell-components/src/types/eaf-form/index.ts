import type { Ref, Reactive } from "vue";
import type { RulesForFormData } from "./rules";
export * from "./rules";

/**
 * API Error Response structure for 422 validation errors
 * Matches the actual API response format
 */
export interface ApiParsedErrorResponse {
  status: number;
  success: boolean;
  validationErrors?: Record<string, string[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  generalMessage?: string;

  // Telemetry information for debugging purposes
  code?: string;
  message?: string;
  traceId?: string;
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
 * Function type for parsing API errors into a structured format
 * @param error The raw error object from the API response
 * @returns Parsed error response conforming to ApiParsedErrorResponse
 */
export interface EafFormApiErrorParser {
  (error: unknown): ApiParsedErrorResponse;
}

/**
 * Configuration options for useEafFormValidation composable
 */
export interface EafFormConfig<T> {
  data: T;
  rules?: RulesForFormData<T>;
  showAllErrors?: boolean;
}

/*
 * Form validation object returned by useEafFormValidation composable
 */
export interface EafForm<T> {
  data: Reactive<T>;
  loading: Ref<boolean>;
  fieldErrors: Reactive<Map<string, string[]>>;
  summaryErrors: Ref<string[]>;
  generalMessage: Ref<string>;
  validate: () => boolean;
  submit: (handleSubmit: (data: T) => Promise<void>) => Promise<void>;
  isFieldRequired: (fieldName: Extract<keyof T, string>) => boolean;
  handleApiError: (error: unknown) => boolean;
  setFieldError: (fieldName: string, messages: string | string[]) => void;
  getFieldError: (fieldName: string) => string | string[] | undefined;
  getAllFieldErrors: (fieldName: string) => string[];
  hasFieldError: (fieldName: string) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  hasErrors: () => boolean;
}
