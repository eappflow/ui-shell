import { ref, reactive } from "vue";
import type { ApiErrorResponse, EafValidationConfig } from "../types";

/**
 * Converts PascalCase or dot-notation field names to camelCase
 * Examples:
 * - "Email" -> "email"
 * - "FirstName" -> "firstName"
 * - "Address.Street" -> "address.street"
 */
function convertFieldName(apiFieldName: string): string {
  return apiFieldName
    .split(".")
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join(".");
}

/**
 * Composable for handling form validation errors from API responses (422)
 * and client-side validation errors
 *
 * @param config Optional configuration for registered fields and display options
 * @returns Validation state and helper functions
 */
export function useEafFormValidation(config?: EafValidationConfig) {
  const registeredFields = ref<string[]>(config?.registeredFields || []);
  const showAllErrors = config?.showAllErrors || false;

  // Reactive validation state
  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref<string>("");

  /**
   * Registers a field dynamically (used by FormItem components)
   *
   * @param fieldName The field name to register
   */
  function registerField(fieldName: string): void {
    if (!registeredFields.value.includes(fieldName)) {
      registeredFields.value.push(fieldName);
    }
  }

  /**
   * Unregisters a field (cleanup when FormItem unmounts)
   *
   * @param fieldName The field name to unregister
   */
  function unregisterField(fieldName: string): void {
    const index = registeredFields.value.indexOf(fieldName);
    if (index > -1) {
      registeredFields.value.splice(index, 1);
    }
  }

  /**
   * Handles API error responses, specifically 422 validation errors
   * Extracts validation errors and maps them to form fields
   *
   * @param error The error object from the API call (typically from axios)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(error: unknown): boolean {
    // Type guard to check if error has response structure
    if (!error || typeof error !== "object" || !("response" in error)) {
      return false;
    }

    const axiosError = error as {
      response?: {
        status?: number;
        data?: ApiErrorResponse;
      };
    };

    // Check if it's a 422 validation error
    if (axiosError.response?.status !== 422) {
      return false;
    }

    const responseData = axiosError.response.data;

    if (!responseData) {
      return false;
    }

    // Clear previous errors
    clearErrors();

    // Extract general message
    if (responseData.message) {
      generalMessage.value = responseData.message;
    }

    // Log traceId for debugging
    if (responseData.traceId) {
      console.warn("[Validation Error]", {
        code: responseData.code,
        message: responseData.message,
        traceId: responseData.traceId,
      });
    }

    // Process validation errors
    if (responseData.validationErrors) {
      const unmatchedErrors: string[] = [];

      Object.entries(responseData.validationErrors).forEach(
        ([apiFieldName, messages]) => {
          const fieldName = convertFieldName(apiFieldName);

          // Check if this field is registered in the form
          const isRegistered =
            registeredFields.value.length === 0 ||
            registeredFields.value.includes(fieldName);

          if (isRegistered && messages.length > 0) {
            // Map to form field
            fieldErrors.set(fieldName, messages);
          } else {
            // Field not registered, add to summary
            messages.forEach((msg) => {
              unmatchedErrors.push(`${apiFieldName}: ${msg}`);
            });
          }
        },
      );

      summaryErrors.value = unmatchedErrors;
    }

    return true;
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
    fieldErrors,
    summaryErrors,
    generalMessage,

    // Helper functions
    handleApiError,
    setFieldError,
    getFieldError,
    getAllFieldErrors,
    hasFieldError,
    clearErrors,
    clearFieldError,
    hasErrors,
    registerField,
    unregisterField,
  };
}
