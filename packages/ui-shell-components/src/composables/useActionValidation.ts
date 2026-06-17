import { useEafMessageStore } from '@/stores/useEafMessageStore'
import type { ApiErrorResponse } from '@/types'

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
  const messageStore = useEafMessageStore()

  /**
   * Handles API error responses, specifically 422 validation errors
   * Extracts validation errors and general message from the response
   * and displays them using the global message store
   * Automatically clears previous validation errors before showing new ones
   *
   * @param error The error object from the API call (typically from axios)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(error: unknown): boolean {
    // Clear previous errors before showing new ones
    messageStore.clearValidationMessage()

    // Type guard to check if error has response structure
    if (!error || typeof error !== 'object' || !('response' in error)) {
      return false
    }

    const axiosError = error as {
      response?: {
        status?: number
        data?: ApiErrorResponse
      }
    }

    // Check if it's a 422 validation error or 400 bad request
    if (axiosError.response?.status !== 422 && axiosError.response?.status !== 400) {
      return false
    }

    const responseData = axiosError.response.data

    if (!responseData) {
      return false
    }

    // Log traceId for debugging
    if (responseData.traceId) {
      console.warn('[Action Validation Error]', {
        code: responseData.code,
        message: responseData.message,
        traceId: responseData.traceId,
        status: axiosError.response.status,
      })
    }

    // Extract validation errors - flatten all field errors into a single list
    const validationErrors: string[] = []

    if (responseData.validationErrors) {
      Object.entries(responseData.validationErrors).forEach(([fieldName, messages]) => {
        messages.forEach((msg) => {
          // Include field name with the message for context
          validationErrors.push(`${fieldName}: ${msg}`)
        })
      })
    }

    // Set validation message in the global store
    messageStore.setValidationMessage(
      responseData.message || 'Validation failed',
      validationErrors,
      'error'
    )

    return true
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
    severity: 'error' | 'warn' | 'info' | 'success' = 'error'
  ): void {
    // Clear previous errors before showing new ones
    messageStore.clearValidationMessage()
    messageStore.setValidationMessage(generalMessage, errors || [], severity)
  }

  /**
   * Clears all validation errors and hides the message
   */
  function clearErrors(): void {
    messageStore.clearValidationMessage()
  }

  return {
    handleApiError,
    setValidationMessage,
    clearErrors,
  }
}
