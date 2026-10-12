import type { Ref, Reactive } from "vue";
import type { z } from "zod";
import type { EafFields } from "./fields";
export * from "./fields";

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

/** A form's config, by its values `T` - typed by `schema` when there is one */
export interface EafFormConfig<T> {
  /** The form's values to start with - and what `resetForm()` puts back */
  defaultValues: T;
  /**
   * What valid values are. Its errors go on the fields at their paths. `""`
   * and `null` count as missing: a field is required unless it is
   * `.optional()` - an empty value that isn't a string needs `.nullable()`,
   * which keeps it required. Messages go on the checks (`.min(1, "...")`) -
   * one on the type itself (`z.string("...")`) also replaces the required message.
   */
  schema?: z.ZodType<unknown, T>;
  /** What `submit()` does with the values once they are valid; its error goes to `handleApiError` */
  onSubmit?: (values: T) => Promise<void> | void;
  /**
   * When a field is checked before `validate()`/`submit()`, default `"blur"`:
   * once focus leaves its `EafFormItem` (or on `$touch()`), and from then on
   * when it changes - as it does once `validate()` ran or while it has an
   * error. `"change"`: whenever it changes. `"submit"`: only by `validate()`.
   */
  validateOn?: "blur" | "change" | "submit";
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
  /** Validates, runs `onSubmit`, passes its error to `handleApiError` */
  submit: () => Promise<void>;
  /** Puts `data` (default: `defaultValues`) into the form and clears its errors, without validating */
  resetForm: (data?: T) => void;
  /** Puts API errors on their fields, the rest in the summary */
  handleApiError: (error: unknown) => boolean;
  clearErrors: () => void;
  hasErrors: () => boolean;
}
