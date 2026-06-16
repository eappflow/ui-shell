import { useMessageStore } from "../stores/useMessageStore";
import type { ApiErrorResponse } from "../types";

/**
 * Composable for handling business validation errors from API action responses.
 * Uses the global message store to display validation messages.
 *
 * Useful for action buttons like Print, Delete, Submit etc.
 */
export function useActionValidation() {
  const messageStore = useMessageStore();

  function handleApiError(error: unknown): boolean {
    messageStore.clearValidationMessage();

    if (!error || typeof error !== "object" || !("response" in error)) {
      return false;
    }

    const axiosError = error as {
      response?: {
        status?: number;
        data?: ApiErrorResponse;
      };
    };

    if (
      axiosError.response?.status !== 422 &&
      axiosError.response?.status !== 400
    ) {
      return false;
    }

    const responseData = axiosError.response.data;
    if (!responseData) return false;

    const validationErrors: string[] = [];

    if (responseData.validationErrors) {
      Object.entries(responseData.validationErrors).forEach(
        ([fieldName, messages]) => {
          messages.forEach((msg) => {
            validationErrors.push(`${fieldName}: ${msg}`);
          });
        },
      );
    }

    messageStore.setValidationMessage(
      responseData.message || "Validation failed",
      validationErrors,
      "error",
    );

    return true;
  }

  function setValidationMessage(
    generalMessage: string,
    errors?: string[],
    severity: "error" | "warn" | "info" | "success" = "error",
  ) {
    messageStore.clearValidationMessage();
    messageStore.setValidationMessage(generalMessage, errors || [], severity);
  }

  function clearErrors() {
    messageStore.clearValidationMessage();
  }

  return {
    handleApiError,
    setValidationMessage,
    clearErrors,
  };
}