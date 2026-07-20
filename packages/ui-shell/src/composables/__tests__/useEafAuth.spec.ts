import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, type Pinia } from "pinia";
import { useEafAuth, AUTH_KEY, type AuthContext } from "../useEafAuth";
import { AUTH_SERVICE_KEY, type AuthService } from "../../services/interfaces";
import type { AuthResult, User } from "../../types";

function createFakeAuthService(user: User): AuthService {
  return {
    login: vi.fn(async (): Promise<AuthResult> => ({ accessToken: "tok-1" })),
    logout: vi.fn(async () => {}),
    getCurrentUser: vi.fn(async () => user),
    requestPasswordReset: vi.fn(async () => {}),
    confirmPasswordReset: vi.fn(async () => {}),
    changePassword: vi.fn(async () => {}),
  };
}

function withSetup<T>(
  composable: () => T,
  provide: Record<string | symbol, unknown> = {},
) {
  let result!: T;
  const pinia = createPinia();
  const wrapper = mount(
    {
      setup() {
        result = composable();
        return () => null;
      },
    },
    {
      global: {
        plugins: [pinia],
        provide,
      },
    },
  );
  return { result, wrapper, pinia };
}

// Re-reads the composable's current snapshot by mounting a throwaway
// component against the same pinia instance - useEafAuth's returned
// fields are plain values captured at call time, not reactive refs.
function readAgain<T>(pinia: Pinia, composable: () => T): T {
  let result!: T;
  mount(
    {
      setup() {
        result = composable();
        return () => null;
      },
    },
    { global: { plugins: [pinia] } },
  );
  return result;
}

const testUser: User = {
  id: "1",
  login: "bob",
  firstName: "Bob",
  lastName: "Builder",
  permissions: ["diagnostics:read", "diagnostics:write"],
};

describe("useEafAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the injected AuthContext as-is when AUTH_KEY is provided", () => {
    const injectedContext: AuthContext = {
      user: null,
      isAuthenticated: false,
      userPermissions: [],
      userName: "",
      login: vi.fn(),
      logout: vi.fn(),
      restorePassword: vi.fn(),
      recoverPassword: vi.fn(),
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    };

    const { result } = withSetup(useEafAuth, {
      [AUTH_KEY as symbol]: injectedContext,
    });

    expect(result).toBe(injectedContext);
  });

  it("falls back to the auth store's initial state when nothing is injected", () => {
    const fakeAuthService = createFakeAuthService(testUser);
    const { result } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    expect(result.isAuthenticated).toBe(false);
    expect(result.user).toBeNull();
    expect(result.userPermissions).toEqual([]);
    expect(result.userName).toBe("");
  });

  it("updates store-derived state after a successful login", async () => {
    const fakeAuthService = createFakeAuthService(testUser);
    const { result, pinia } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    await result.login("bob", "secret");
    const afterLogin = readAgain(pinia, useEafAuth);

    expect(fakeAuthService.login).toHaveBeenCalledWith({
      login: "bob",
      password: "secret",
    });
    expect(afterLogin.isAuthenticated).toBe(true);
    expect(afterLogin.user).toEqual(testUser);
    expect(afterLogin.userName).toBe("Bob Builder");
    expect(afterLogin.userPermissions).toEqual([
      "diagnostics:read",
      "diagnostics:write",
    ]);
  });

  it("rejects and leaves state unauthenticated when the AuthService login call fails", async () => {
    const fakeAuthService = createFakeAuthService(testUser);
    fakeAuthService.login = vi
      .fn()
      .mockRejectedValue(new Error("Invalid credentials"));
    const { result, pinia } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    await expect(result.login("bob", "wrong-password")).rejects.toThrow(
      "Invalid credentials",
    );
    const afterFailedLogin = readAgain(pinia, useEafAuth);

    expect(afterFailedLogin.isAuthenticated).toBe(false);
    expect(afterFailedLogin.user).toBeNull();
  });

  it("clears store-derived state on logout", async () => {
    const fakeAuthService = createFakeAuthService(testUser);
    const { result, pinia } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    await result.login("bob", "secret");
    await result.logout();
    const afterLogout = readAgain(pinia, useEafAuth);

    expect(fakeAuthService.logout).toHaveBeenCalled();
    expect(afterLogout.isAuthenticated).toBe(false);
    expect(afterLogout.user).toBeNull();
  });

  it("delegates restorePassword and recoverPassword to the injected AuthService", async () => {
    const fakeAuthService = createFakeAuthService(testUser);
    const { result } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    await result.restorePassword("bob@example.com");
    expect(fakeAuthService.requestPasswordReset).toHaveBeenCalledWith({
      email: "bob@example.com",
    });

    await result.recoverPassword("reset-token", "newPass123");
    expect(fakeAuthService.confirmPasswordReset).toHaveBeenCalledWith({
      token: "reset-token",
      newPassword: "newPass123",
    });
  });

  it("evaluates permission checks against the logged-in user's permissions", async () => {
    const fakeAuthService = createFakeAuthService(testUser);
    const { result, pinia } = withSetup(useEafAuth, {
      [AUTH_SERVICE_KEY as symbol]: fakeAuthService,
    });

    // No user yet - every permission check is false.
    expect(result.hasPermission("diagnostics:read")).toBe(false);
    expect(result.hasAnyPermission(["diagnostics:read"])).toBe(false);
    expect(result.hasAllPermissions(["diagnostics:read"])).toBe(false);

    await result.login("bob", "secret");
    const afterLogin = readAgain(pinia, useEafAuth);

    expect(afterLogin.hasPermission("diagnostics:read")).toBe(true);
    expect(afterLogin.hasPermission("diagnostics:delete")).toBe(false);
    expect(
      afterLogin.hasAnyPermission(["diagnostics:delete", "diagnostics:write"]),
    ).toBe(true);
    expect(
      afterLogin.hasAllPermissions(["diagnostics:read", "diagnostics:write"]),
    ).toBe(true);
    expect(
      afterLogin.hasAllPermissions(["diagnostics:read", "diagnostics:delete"]),
    ).toBe(false);
  });
});
