import { inject } from "vue";
import { useEafMessageStore } from "../stores/useEafMessageStore";
import { EAF_FORM_KEY } from "./useEafForm";

/**
 * Composable for handling business validation errors from API action responses
 * Uses the global message store to display validation messages
 *
 * Use this for action buttons like Print, Delete, Submit, etc. where the API
 * might return validation errors or business rule violations.
 *
 * @returns Helper functions for handling validation errors
 */
export function useActionValidation() {
  const messageStore = useEafMessageStore();
  const errorParser = inject(EAF_FORM_KEY, null);

  /**
   * Handles API error responses that the errorParser marks as validation
   * errors to handle (response.handleErrors)
   * Extracts validation errors and general message from the response
   * and displays them using the global message store
   * Automatically clears previous validation errors before showing new ones
   *
   * @param rawError The error object from the API call, parsed via the
   *   host-provided error parser (see EAF_FORM_KEY / useEafForm)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(rawError: unknown): boolean {
    // Clear previous errors before showing new ones
    messageStore.clearValidationMessage();

    if (errorParser === null) {
      console.warn(
        "[useActionValidation] No error parser provided. Please provide an error parser using EAF_FORM_KEY injection.",
      );
      return false;
    }

    const response = errorParser(rawError);

    if (response.handleErrors === false) {
      return false;
    }

    // Log traceId for debugging
    if (response.traceId) {
      console.warn("[Action Validation Error]", {
        code: response.code,
        message: response.message,
        traceId: response.traceId,
        status: response.status,
      });
    }

    // Extract validation errors - flatten all field errors into a single list
    const validationErrors: string[] = [];

    if (response.validationErrors) {
      Object.entries(response.validationErrors).forEach(
        ([fieldName, messages]) => {
          messages.forEach((msg) => {
            // Include field name with the message for context
            validationErrors.push(`${fieldName}: ${msg}`);
          });
        },
      );
    }

    // Set validation message in the global store
    messageStore.setValidationMessage(
      response.generalMessage || "Validation failed",
      validationErrors,
      "error",
    );

    return true;
  }

  /**
   * Sets custom validation messages (client-side validation)
   * Automatically clears previous validation errors before showing new ones
   *
   * @param generalMessage The general error message
   * @param errors Optional array of specific validation errors
   * @param severity Optional severity level (default: 'error')
   */
  function setValidationMessage(
    generalMessage: string,
    errors?: string[],
    severity: "error" | "warn" | "info" | "success" = "error",
  ): void {
    // Clear previous errors before showing new ones
    messageStore.clearValidationMessage();
    messageStore.setValidationMessage(generalMessage, errors || [], severity);
  }

  /**
   * Clears all validation errors and hides the message
   */
  function clearErrors(): void {
    messageStore.clearValidationMessage();
  }

  return {
    handleApiError,
    setValidationMessage,
    clearErrors,
  };
}
