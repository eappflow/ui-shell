import type { ApiParsedErrorResponse } from "@eappflow/ui-shell-components";

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: {
      success?: boolean;
      code?: string;
      message?: string;
      traceId?: string;
      validationErrors?: Record<string, string[]>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details?: any;
    };
  };
}

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return !!error && typeof error === "object" && "response" in error;
}

/**
 * Default error parser — understands Axios-shaped errors.
 * Host applications using a different HTTP client should provide their own
 * via services.parseApiError in the EAppFlowUIShell plugin options.
 */
export function defaultParseApiError(error: unknown): ApiParsedErrorResponse {
  if (!isAxiosLikeError(error)) {
    return { status: 0, success: false };
  }

  const data = error.response?.data;

  return {
    status: error.response?.status ?? 0,
    success: data?.success ?? false,
    code: data?.code,
    message: data?.message,
    traceId: data?.traceId,
    generalMessage: data?.message,
    validationErrors: data?.validationErrors,
    details: data?.details,
  };
}
