import { inject } from "vue";
import { useEafMessageStore } from "../stores/useEafMessageStore";
import type { ApiParsedErrorResponse } from "../types";
import { EAF_FORM_KEY } from "./useEafForm";

/**
 * Composable for handling business validation errors from API action responses
 * Uses the global message store to display validation messages
 *
 * Use this for action buttons like Print, Delete, Submit, etc. where the API
 * might return validation errors (422) or business rule violations.
 *
 * @returns Helper functions for handling validation errors
 */
export function useActionValidation() {
  const messageStore = useEafMessageStore();
  const errorParser = inject(EAF_FORM_KEY, null);

  /**
   * Handles API error responses, specifically 422/400 validation errors
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
    }

    const response = (
      errorParser ? errorParser(rawError) : rawError
    ) as ApiParsedErrorResponse;

    // Check if it's a 422 validation error or 400 bad request
    if (response.status !== 422 && response.status !== 400) {
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
