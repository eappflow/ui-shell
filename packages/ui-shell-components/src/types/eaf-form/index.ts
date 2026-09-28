import type { Ref, Reactive } from "vue";
import type { EafFieldPath, EafFields } from "./fields";
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
 * Per-call options of `EafForm.handleApiError`
 */
export interface EafApiErrorOptions {
  /**
   * Maps every validation-error key of the API response (a dot path, as
   * returned by the error parser) to a path in the form data, before it is
   * matched to a field. Use it when the request sent to the server nests the
   * fields differently than the form data does. Keys that still match no field
   * go to the summary under the mapped path.
   *
   * @example
   * // The form holds the create request `{ name, address }`, but the update
   * // request is `{ baseInfo: { name, address }, data }`, so the server
   * // reports `baseInfo.address.street` for the `address.street` field.
   * await $f.submit(save, {
   *   mapErrorPath: (path) => path.replace(/^baseInfo\./, ""),
   * });
   */
  mapErrorPath?: (path: string) => string;
  /**
   * Called with every error path (after `mapErrorPath`); returning `true`
   * sends that error to the summary (`"path: message"`) even though the path
   * exists in the form data. Use it for parts of the data the form holds but
   * renders no `EafFormItem` for (e.g. a key/value map edited by a custom
   * component), so their errors are still shown somewhere.
   *
   * @example
   * // `data` is a key/value map without an EafFormItem per key
   * await $f.submit(save, {
   *   showInSummary: (path) => path.startsWith("data."),
   * });
   */
  showInSummary?: (path: string) => boolean;
}

/**
 * Per-call options of `EafForm.submit` - passed on to `handleApiError` when
 * the submit handler throws
 */
export type EafSubmitOptions = EafApiErrorOptions;

/**
 * Configuration options for useEafFormValidation composable
 */
export interface EafFormConfig<T> {
  data: T;
  /**
   * Validation rules mirroring the shape of `data` (nested objects included),
   * see {@link EafRules}
   */
  rules?: EafRules<T>;
  showAllErrors?: boolean;
}

/*
 * Form validation object returned by useEafFormValidation composable
 */
export interface EafForm<T> {
  data: Reactive<T>;
  /**
   * Field handles mirroring `data`, e.g. `$f.fields.address.street` - pass
   * them to `EafFormItem`'s `field` prop (see `EafField`)
   */
  fields: EafFields<T>;
  loading: Ref<boolean>;
  fieldErrors: Reactive<Map<string, string[]>>;
  summaryErrors: Ref<string[]>;
  generalMessage: Ref<string>;
  validate: () => boolean;
  /**
   * Validates, then runs `handleSubmit` with `loading` set; an error it
   * throws goes to `handleApiError(error, options)`
   */
  submit: (
    handleSubmit: (data: T) => Promise<void>,
    options?: EafSubmitOptions,
  ) => Promise<void>;
  resetForm: () => void;
  /**
   * Whether the field at `path` (e.g. `"email"`, `"address.street"`) has a
   * `required` rule. Prefer `$f.fields.<path>.$required`.
   */
  isFieldRequired: (path: EafFieldPath<T>) => boolean;
  /**
   * Shows a parsed API validation error on the form: errors on paths present
   * in `data` go to their fields, the rest to the summary. See
   * {@link EafApiErrorOptions.mapErrorPath} when the request shape differs
   * from the form data, and {@link EafApiErrorOptions.showInSummary} for
   * paths in `data` that no field displays.
   */
  handleApiError: (error: unknown, options?: EafApiErrorOptions) => boolean;
  setFieldError: (fieldName: string, messages: string | string[]) => void;
  getFieldError: (fieldName: string) => string | string[] | undefined;
  getAllFieldErrors: (fieldName: string) => string[];
  hasFieldError: (fieldName: string) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  hasErrors: () => boolean;
}
