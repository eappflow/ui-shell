import { ref, reactive } from "vue";
import type { ApiErrorResponse, ValidationConfig } from "../types";

/**
 * Converts PascalCase or dot-notation field names to camelCase.
 */
function convertFieldName(apiFieldName: string): string {
  return apiFieldName
    .split(".")
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join(".");
}

/**
 * Composable for handling form validation errors from API responses (422)
 * and client-side validation errors.
 *
 * Ported from Ms.Dc.ServerUi.Web and made generic.
 */
export function useFormValidation(config?: ValidationConfig) {
  const registeredFields = ref<string[]>(config?.registeredFields || []);
  const showAllErrors = config?.showAllErrors || false;

  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref<string>("");

  function registerField(fieldName: string): void {
    if (!registeredFields.value.includes(fieldName)) {
      registeredFields.value.push(fieldName);
    }
  }

  function unregisterField(fieldName: string): void {
    const index = registeredFields.value.indexOf(fieldName);
    if (index > -1) {
      registeredFields.value.splice(index, 1);
    }
  }

  function handleApiError(error: unknown): boolean {
    if (!error || typeof error !== "object" || !("response" in error)) {
      return false;
    }

    const axiosError = error as {
      response?: {
        status?: number;
        data?: ApiErrorResponse;
      };
    };

    if (axiosError.response?.status !== 422) {
      return false;
    }

    const responseData = axiosError.response.data;
    if (!responseData) return false;

    clearErrors();

    if (responseData.message) {
      generalMessage.value = responseData.message;
    }

    if (responseData.traceId) {
      console.warn("[Validation Error]", {
        code: responseData.code,
        message: responseData.message,
        traceId: responseData.traceId,
      });
    }

    if (responseData.validationErrors) {
      const unmatchedErrors: string[] = [];

      Object.entries(responseData.validationErrors).forEach(
        ([apiFieldName, messages]) => {
          const fieldName = convertFieldName(apiFieldName);
          const isRegistered =
            registeredFields.value.length === 0 ||
            registeredFields.value.includes(fieldName);

          if (isRegistered && messages.length > 0) {
            fieldErrors.set(fieldName, messages);
          } else {
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

  function setFieldError(fieldName: string, messages: string | string[]) {
    const errorArray = Array.isArray(messages) ? messages : [messages];
    fieldErrors.set(fieldName, errorArray);
  }

  function getFieldError(fieldName: string): string | string[] | undefined {
    const errors = fieldErrors.get(fieldName);
    if (!errors || errors.length === 0) return undefined;
    return showAllErrors ? errors : errors[0];
  }

  function hasFieldError(fieldName: string): boolean {
    const errors = fieldErrors.get(fieldName);
    return errors !== undefined && errors.length > 0;
  }

  function clearErrors(): void {
    fieldErrors.clear();
    summaryErrors.value = [];
    generalMessage.value = "";
  }

  function clearFieldError(fieldName: string): void {
    fieldErrors.delete(fieldName);
  }

  function hasErrors(): boolean {
    return (
      fieldErrors.size > 0 ||
      summaryErrors.value.length > 0 ||
      generalMessage.value.length > 0
    );
  }

  return {
    registerField,
    unregisterField,
    handleApiError,
    setFieldError,
    getFieldError,
    hasFieldError,
    clearErrors,
    clearFieldError,
    hasErrors,
    fieldErrors,
    summaryErrors,
    generalMessage,
  };
}