/**
 * Fake Microsoft SSO Service - Demo implementation
 *
 * Implements the MicrosoftSSOService interface from @eappflow/ui-shell
 * for demo / development purposes.
 */
import type { AuthResult } from "@eappflow/ui-shell";
import { MicrosoftSSOService } from "../../../../packages/ui-shell/src/services/interfaces";

export function createFakeMicrosoftSSOService(): MicrosoftSSOService {
  return {
    enabled: true,
    config: {
      clientId: "fake-client-id",
      scopes: ["user.read"],
      authority: "https://login.microsoftonline.com/fake-tenant-id",
    },
    async login(_request: { accessToken: string }): Promise<AuthResult> {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500));

      // Any credentials work in demo mode
      return {
        accessToken: "fake-jwt-token-demo-user",
      };
    },
  };
}
