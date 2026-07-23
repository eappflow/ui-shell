/**
 * Simple error parser - Demo implementation
 *
 * The fake services in this demo throw plain Error objects (there's no real
 * HTTP layer), so this maps straight to a generalMessage instead of parsing
 * an Axios response shape like the @eappflow/ui-shell default does.
 */
import type { EafFormApiErrorParser } from "@eappflow/ui-shell-components";

export const parseApiError: EafFormApiErrorParser = (error) => {
  if (!(error instanceof Error)) {
    return { status: 0, success: false };
  }

  return {
    status: 422,
    success: false,
    generalMessage: error.message,
  };
};
