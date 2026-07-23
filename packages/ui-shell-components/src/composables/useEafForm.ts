import { ref, reactive, InjectionKey, inject } from "vue";
import type {
  ApiParsedErrorResponse,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
  EafFormRuleLength,
  EafFormRulePattern,
  EafFormRuleRange,
  EafFormRuleRequired,
} from "../types";

type FieldRule = Partial<
  EafFormRuleRequired &
    EafFormRuleLength &
    EafFormRulePattern &
    EafFormRuleRange
>;

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

/**
 * Checks a single field's value against its rules
 *
 * @returns Validation error messages for the field (empty if valid)
 */
function getFieldViolations(value: unknown, rules: FieldRule): string[] {
  const messages: string[] = [];

  if (rules.required?.required && isEmptyValue(value)) {
    messages.push(rules.required.message);
  }

  if (typeof value === "string") {
    const { length, pattern } = rules;
    if (length?.minLength !== undefined && value.length < length.minLength) {
      messages.push(length.message);
    }
    if (length?.maxLength !== undefined && value.length > length.maxLength) {
      messages.push(length.message);
    }
    if (pattern && !pattern.regex.test(value)) {
      messages.push(pattern.message);
    }
  }

  if (typeof value === "number" && rules.range) {
    const { min, max, message } = rules.range;
    if (min !== undefined && value < min) {
      messages.push(message);
    }
    if (max !== undefined && value > max) {
      messages.push(message);
    }
  }

  return messages;
}

export const EAF_FORM_KEY: InjectionKey<EafFormApiErrorParser> = Symbol(
  "eaf:form-error-parser",
);

/**
 * Composable for handling form validation errors from API responses (422)
 * and client-side validation errors
 *
 * @param config Form data and validation rules
 * @returns Validation state and helper functions
 */
export function useEafForm<T extends object>(
  config: EafFormConfig<T>,
): EafForm<T> {
  const errorParser = inject(EAF_FORM_KEY, null);
  const showAllErrors = config.showAllErrors || false;
  const data = reactive(config.data);

  // Reactive validation state
  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref<string>("");
  const loading = ref(false);

  /**
   * Handles API error responses, specifically 422 validation errors
   * Extracts validation errors and maps them to form fields
   *
   * @param error The error object from the API call (typically from axios)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(rawError: unknown): boolean {
    if (errorParser === null) {
      console.warn(
        "[useEafForm] No error parser provided. Please provide an error parser using EAF_FORM_KEY injection.",
      );
    }

    const response = (
      errorParser ? errorParser(rawError) : rawError
    ) as ApiParsedErrorResponse;

    // Check if it's a 422 validation error
    if (response.status !== 422) {
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
      console.warn("[Validatio1n Error]", {
        code: response.code,
        message: response.message,
        traceId: response.traceId,
      });
    }

    // Process validation errors
    if (response?.validationErrors) {
      const unmatchedErrors: string[] = [];

      Object.entries(response.validationErrors).forEach(
        ([fieldName, messages]) => {
          // Check if this field is registered in the form
          const isRegistered = fieldName in data;

          if (isRegistered && messages.length > 0) {
            // Map to form field
            fieldErrors.set(fieldName, messages);
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

    for (const fieldName of Object.keys(rules) as Array<
      Extract<keyof T, string>
    >) {
      const fieldRules = rules[fieldName] as FieldRule | undefined;
      if (!fieldRules) {
        continue;
      }

      const value = (data as T)[fieldName];
      const messages = getFieldViolations(value, fieldRules);

      if (messages.length > 0) {
        setFieldError(fieldName, messages);
      }
    }

    return !hasErrors();
  }

  async function submit(
    handleSubmit: (data: T) => Promise<void>,
  ): Promise<void> {
    if (!validate()) {
      return;
    }

    loading.value = true;
    try {
      await handleSubmit(data as T);
    } catch (error) {
      handleApiError(error);
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
   * @returns Array of all error messages or empty array if none
   */
  function getAllFieldErrors(fieldName: string): string[] {
    return fieldErrors.get(fieldName) || [];
  }

  /**
   * Checks if a field has any validation errors
   *
   * @param fieldName The field name (camelCase)
   * @returns true if field has errors, false otherwise
   */
  function hasFieldError(fieldName: string): boolean {
    const errors = fieldErrors.get(fieldName);
    return errors !== undefined && errors.length > 0;
  }

  function isFieldRequired(fieldName: Extract<keyof T, string>): boolean {
    const rules = config.rules?.[fieldName] as FieldRule | undefined;
    return rules?.required?.required === true;
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

  return {
    // Reactive state
    data,
    loading,
    fieldErrors,
    summaryErrors,
    generalMessage,

    // Helper functions
    submit,
    validate,
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
