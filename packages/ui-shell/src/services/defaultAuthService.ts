/**
 * Default auth service — always throws.
 * Host applications MUST provide their own implementation via DI.
 *
 * This enforces the Dependency Inversion Principle:
 * ui-shell defines the contract, apps provide the implementation.
 */
import type { AuthService } from "./interfaces";

export function createDefaultAuthService(): AuthService {
  return {
    async login() {
      throw new Error(
        "[ui-shell] No AuthService provided. Implement AuthService and provide it via app.provide(AUTH_SERVICE_KEY, ...).",
      );
    },
    async logout() {
      // no-op by default
    },
    async getCurrentUser() {
      throw new Error("[ui-shell] No AuthService provided.");
    },
    async requestPasswordReset() {
      throw new Error("[ui-shell] No AuthService provided.");
    },
    async confirmPasswordReset() {
      throw new Error("[ui-shell] No AuthService provided.");
    },
    async changePassword() {
      throw new Error("[ui-shell] No AuthService provided.");
    },
    async handleMicrosoftSSORedirect(response) {
      throw new Error("[ui-shell] No AuthService provided.");
    },
  };
}
