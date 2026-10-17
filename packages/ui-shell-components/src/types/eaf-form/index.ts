import type { ComputedRef, Ref, Reactive } from "vue";
import type { z } from "zod";
import type { EafFields, EafLeaf } from "./fields";
import type { EafAiDescriptions } from "./descriptions";
export * from "./fields";
export * from "./descriptions";

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
 * The form's values `T` as its schema may take them: a sub-object may also be
 * `null` or missing - the form holds one for its inputs, and sends it as
 * `null` once left empty (see `onSubmit`), e.g. an API's optional address
 */
export type EafSchemaInput<T> = {
  [K in keyof T as NonNullable<T[K]> extends EafLeaf ? K : never]: T[K];
} & {
  [K in keyof T as NonNullable<T[K]> extends EafLeaf
    ? never
    : K]?: EafSchemaInput<NonNullable<T[K]>> | null;
};

/** A form's config, by its values `T` - typed by `schema` when there is one */
export interface EafFormConfig<T> {
  /**
   * What to start with, over the schema's own empty values (and its
   * `.default()`/`.prefault()`): a form-only field, or one whose empty value
   * differs from the schema. Optional when `schema` is given - the schema
   * decides the rest.
   */
  defaultValues?: Partial<T>;
  /**
   * What valid values are - e.g. the request's schema generated from the
   * API. Its errors go on the fields at their paths. A field is required when
   * its schema takes no empty value: neither `undefined` nor `null`, nor `""`
   * for a string - `z.string().min(1)`, `z.number()`, an id `z.string()` held
   * as `null`; `z.string()` and `.nullable()` ones may stay empty. An empty
   * field gets the translated required message, unless the schema gives its
   * own (`.min(1, "...")`, `z.string("...")`).
   */
  schema?: z.ZodType<unknown, T> | z.ZodType<unknown, EafSchemaInput<T>>;
  /**
   * What `submit()` does with the values once they are valid; its error goes
   * to `handleApiError`. Empty values (`""`, a sub-object left empty) come as
   * `null` where the schema takes `null`, else left out (`undefined`) where it
   * takes that - checked like that too - while `data` keeps them for the inputs.
   */
  onSubmit?: (values: T) => Promise<void> | void;
  /**
   * When a field is checked before `validate()`/`submit()`, default `"blur"`:
   * once focus leaves its `EafFormItem` (or on `$touch()`), and from then on
   * when it changes - as it does once `validate()` ran or while it has an
   * error. `"change"`: whenever it changes. `"submit"`: only by `validate()`.
   */
  validateOn?: "blur" | "change" | "submit";
  /**
   * Let the AI chat read and fill the form (default `true`), see
   * `useEafChat` - descriptions, nested like the values, tell it what the form
   * and its fields are for when that isn't plain, see {@link EafAiDescriptions}
   */
  exposeToAi?: boolean | EafAiDescriptions<T>;
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
  /**
   * Errors of fields no `EafFormItem` shows (`$display`), as `path: message` -
   * e.g. an id the form holds without an input, or a field in a collapsed
   * section. `EafFormValidationSummary` shows them with `summaryErrors`.
   */
  undisplayedErrors: ComputedRef<string[]>;
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
