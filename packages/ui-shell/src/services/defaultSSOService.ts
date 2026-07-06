/**
 * Default Microsoft SSO service — always throws.
 * Host applications MUST provide their own implementation via DI.
 *
 * This enforces the Dependency Inversion Principle:
 * ui-shell defines the contract, apps provide the implementation.
 */
import type { MicrosoftSSOService } from "./interfaces";

export function createDefaultMicrosoftSSOConfig(): MicrosoftSSOService {
  return {
    enabled: false,
    config: {
      clientId: "",
      scopes: [],
      authority: "",
    },
    async login() {
      throw new Error(
        "[ui-shell] No MicrosoftSSOConfig provided. Implement MicrosoftSSOConfig and provide it via app.provide(MSAL_INSTANCE_KEY, ...).",
      );
    },
  };
}
