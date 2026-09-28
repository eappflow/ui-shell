import { ref, reactive, InjectionKey, inject } from "vue";
import { useI18n, type Composer } from "vue-i18n";
import type {
  EafApiErrorOptions,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
  EafSubmitOptions,
} from "../types";
import {
  getFieldViolations,
  type FieldRule,
} from "../validators/fieldValidators";
import { cloneDeep } from "../utils/cloneDeep";
import { getByPath, hasPath, isPlainObject } from "../utils/path";
import { createEafFields } from "./eafFields";

export const EAF_FORM_KEY: InjectionKey<EafFormApiErrorParser> = Symbol(
  "eaf:form-error-parser",
);

// Overridable via i18nConfig.messages, like any other shell translation.
const REQUIRED_MESSAGE_KEY = "validation.required";

/**
 * Composable for handling form validation errors from API responses
 * and client-side validation errors
 *
 * @param config Form data and validation rules
 * @returns Validation state and helper functions
 */
export function useEafForm<T extends object>(
  config: EafFormConfig<T>,
): EafForm<T> {
  const errorParser = inject(EAF_FORM_KEY, null);

  // null when no vue-i18n plugin is installed
  let t: Composer["t"] | null = null;
  try {
    ({ t } = useI18n({ useScope: "global" }));
  } catch {
    /* no-op */
  }

  const showAllErrors = config.showAllErrors || false;
  const data = reactive(config.data);
  const initialData: T = cloneDeep(config.data);

  // Reactive validation state
  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref<string>("");
  const loading = ref(false);

  /**
   * Handles API error responses that the errorParser marks as validation
   * errors to handle (response.handleErrors)
   * Extracts validation errors and maps them to form fields
   *
   * @param error The error object from the API call (typically from axios)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(
    rawError: unknown,
    options?: EafApiErrorOptions,
  ): boolean {
    if (errorParser === null) {
      console.warn(
        "[useEafForm] No error parser provided. Please provide an error parser using EAF_FORM_KEY injection.",
      );
      return false;
    }

    const response = errorParser(rawError);

    if (response.handleErrors === false) {
      return false;
    }

    // Clear previous errors
    clearErrors();

    // Extract general message
    if (response?.generalMessage) {
      generalMessage.value = response.generalMessage;
    }

    // Log traceId for debugging
    if (response?.traceId) {
      console.warn("[Validation Error]", {
        code: response.code,
        message: response.message,
        traceId: response.traceId,
      });
    }

    // Process validation errors
    if (response?.validationErrors) {
      const unmatchedErrors: string[] = [];

      const mapErrorPath = options?.mapErrorPath;
      const showInSummary = options?.showInSummary;

      Object.entries(response.validationErrors).forEach(
        ([errorPath, messages]) => {
          const fieldName = mapErrorPath ? mapErrorPath(errorPath) : errorPath;

          // Check if this field is registered in the form
          const isRegistered =
            hasPath(data, fieldName) && !showInSummary?.(fieldName);

          if (isRegistered && messages.length > 0) {
            // Map to form field
            const existing = fieldErrors.get(fieldName) ?? [];
            fieldErrors.set(fieldName, [...existing, ...messages]);
          } else {
            // Field not registered, add to summary
            messages.forEach((msg) => {
              unmatchedErrors.push(`${fieldName}: ${msg}`);
            });
          }
        },
      );

      summaryErrors.value = unmatchedErrors;
    }

    return true;
  }

  function validate(): boolean {
    clearErrors();

    const rules = config.rules;
    if (!rules) {
      return true;
    }

    validateRules(data, rules as Record<string, unknown>, "");

    return !hasErrors();
  }

  function validateRules(
    values: unknown,
    rules: Record<string, unknown>,
    parentPath: string,
  ): void {
    for (const key of Object.keys(rules)) {
      if (parentPath !== "" && key === "required") {
        continue;
      }

      const fieldRules = rules[key];
      if (!isPlainObject(fieldRules)) {
        continue;
      }

      const path = parentPath === "" ? key : `${parentPath}.${key}`;
      const value =
        values !== null && typeof values === "object"
          ? (values as Record<string, unknown>)[key]
          : undefined;

      if (isPlainObject(value)) {
        validateRules(value, fieldRules, path);
        continue;
      }

      const messages = getFieldViolations(
        value,
        withTranslatedRequiredMessage(fieldRules as FieldRule),
      );
      if (messages.length > 0) {
        setFieldError(path, messages);
      }
    }
  }

  function withTranslatedRequiredMessage(fieldRules: FieldRule): FieldRule {
    return fieldRules.required === true && t
      ? { ...fieldRules, required: { message: t(REQUIRED_MESSAGE_KEY) } }
      : fieldRules;
  }

  async function submit(
    handleSubmit: (data: T) => Promise<void>,
    options?: EafSubmitOptions,
  ): Promise<void> {
    if (!validate()) {
      return;
    }

    loading.value = true;
    try {
      await handleSubmit(data as T);
    } catch (error) {
      handleApiError(error, options);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Sets validation error(s) for a specific field (client-side validation)
   *
   * @param fieldName The field name (camelCase)
   * @param messages Error message(s) - can be a single string or array
   */
  function setFieldError(fieldName: string, messages: string | string[]): void {
    const errorArray = Array.isArray(messages) ? messages : [messages];
    fieldErrors.set(fieldName, errorArray);
  }

  /**
   * Gets the error message(s) for a specific field
   *
   * @param fieldName The field name (camelCase)
   * @returns First error message by default, or all messages if showAllErrors is true
   */
  function getFieldError(fieldName: string): string | string[] | undefined {
    const errors = fieldErrors.get(fieldName);

    if (!errors || errors.length === 0) {
      return undefined;
    }

    return showAllErrors ? errors : errors[0];
  }

  /**
   * Gets all error messages for a specific field (regardless of config)
   *
   * @param fieldName The field name (camelCase)
   * @returns Array of all error messages for the field, or empty array if none
   */
  function getAllFieldErrors(fieldName: string): string[] {
    return fieldErrors.get(fieldName) || [];
  }

  /**
   * Checks if a field has any validation errors
   *
   * @param fieldName The field name (camelCase)
   * @returns true if the field has errors, false otherwise
   */
  function hasFieldError(fieldName: string): boolean {
    const errors = fieldErrors.get(fieldName);
    return errors !== undefined && errors.length > 0;
  }

  function isFieldRequired(path: string): boolean {
    const fieldRules = getByPath(config.rules, path);
    return isPlainObject(fieldRules) && Boolean(fieldRules.required);
  }

  /**
   * Clears all validation errors (field-level, summary, and general message)
   */
  function clearErrors(): void {
    fieldErrors.clear();
    summaryErrors.value = [];
    generalMessage.value = "";
  }

  /**
   * Clears validation errors for a specific field
   *
   * @param fieldName The field name (camelCase)
   */
  function clearFieldError(fieldName: string): void {
    fieldErrors.delete(fieldName);
  }

  function resetForm(): void {
    clearErrors();
    Object.assign(data, cloneDeep(initialData));
  }

  /**
   * Checks if there are any validation errors present
   *
   * @returns true if any errors exist (field, summary, or general), false otherwise
   */
  function hasErrors(): boolean {
    return (
      fieldErrors.size > 0 ||
      summaryErrors.value.length > 0 ||
      generalMessage.value !== ""
    );
  }

  const fields = createEafFields<T>({
    getErrors: getAllFieldErrors,
    isRequired: isFieldRequired,
    showAllErrors,
  });

  return {
    // Reactive state
    data,
    fields,
    loading,
    fieldErrors,
    summaryErrors,
    generalMessage,

    // Helper functions
    submit,
    validate,
    resetForm,
    isFieldRequired,
    handleApiError,
    setFieldError,
    getFieldError,
    getAllFieldErrors,
    hasFieldError,
    clearErrors,
    clearFieldError,
    hasErrors,
  };
}
