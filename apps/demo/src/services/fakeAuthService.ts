/**
 * Fake Auth Service - Demo implementation
 *
 * Implements the AuthService interface from @eappflow/ui-shell
 * for demo / development purposes.
 */
import type {
  AuthService,
  AuthResult,
  User,
} from "@eappflow/ui-shell";

export function createFakeAuthService(): AuthService {
  return {
    async login(_request: { login: string; password: string }): Promise<AuthResult> {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500));

      // Any credentials work in demo mode
      return {
        accessToken: "fake-jwt-token-demo-user",
      };
    },

    async logout(): Promise<void> {
      // no-op in demo
    },

    async getCurrentUser(): Promise<User> {
      return {
        id: "1",
        login: "demo",
        firstName: "Demo",
        lastName: "User",
        email: "demo@eappflow.io",
        permissions: [          
          "Documents",
          "Employees",
          "Locations",
          "BusinessUnits",
          "Workstations",
          "TenantSettings",
          "ExternalEvent",
          "TechnicalAdministrator"
        ],
      };
    },

    async requestPasswordReset(_request: { email: string }): Promise<void> {
      await new Promise((r) => setTimeout(r, 300));
      // Always succeeds in demo mode
    },

    async confirmPasswordReset(_request: {
      token: string;
      newPassword: string;
    }): Promise<void> {
      await new Promise((r) => setTimeout(r, 300));
      if (!_request.token) {
        throw new Error("Invalid token");
      }
    },

    async changePassword(_request: {
      currentPassword: string;
      newPassword: string;
    }): Promise<void> {
      await new Promise((r) => setTimeout(r, 300));
      // In demo mode, any password change succeeds
    },
  };
}