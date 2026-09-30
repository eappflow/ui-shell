import type { Ref, Reactive } from "vue";
import type { EafFields } from "./fields";
import type { EafRules } from "./rules";
export * from "./fields";
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

  /**
   * Whether useEafForm/useActionValidation should treat this response as a
   * validation error to handle. The parser decides this (e.g. based on
   * status code) rather than the consuming composable.
   */
  handleErrors?: boolean;

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
  /** Rules mirroring `data`, see {@link EafRules} */
  rules?: EafRules<T>;
  /** Check a field's rules when its value changes (default `true`) */
  validateOnChange?: boolean;
}

/*
 * Form validation object returned by useEafFormValidation composable
 */
export interface EafForm<T> {
  data: Reactive<T>;
  /** Fields mirroring `data`, with their errors (see `EafField`) */
  fields: EafFields<T>;
  loading: Ref<boolean>;
  fieldErrors: Reactive<Map<string, string[]>>;
  summaryErrors: Ref<string[]>;
  generalMessage: Ref<string>;
  validate: () => boolean;
  /** Validates, runs `handleSubmit`, passes its error to `handleApiError` */
  submit: (handleSubmit: (data: T) => Promise<void>) => Promise<void>;
  resetForm: () => void;
  /** Puts API errors on their fields, the rest in the summary */
  handleApiError: (error: unknown) => boolean;
  clearErrors: () => void;
  hasErrors: () => boolean;
}
