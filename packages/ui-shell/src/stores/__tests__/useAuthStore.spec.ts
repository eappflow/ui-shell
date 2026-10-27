import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { useAuthStore } from "../useAuthStore";
import {
  AUTH_SERVICE_KEY,
  type AuthService,
  type SessionAuthService,
  type TokenAuthService,
} from "../../services/interfaces";
import type { User } from "../../types";

const testUser: User = {
  id: "1",
  login: "bob",
  firstName: "Bob",
  lastName: "Builder",
  permissions: ["a"],
};

function createSessionAuthService(
  getCurrentUser: () => Promise<User>,
): SessionAuthService {
  return {
    mode: "session",
    login: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    getCurrentUser: vi.fn(getCurrentUser),
    requestPasswordReset: vi.fn(async () => {}),
    confirmPasswordReset: vi.fn(async () => {}),
    changePassword: vi.fn(async () => {}),
    linkMicrosoftAccount: vi.fn(async () => {}),
  };
}

function createTokenAuthService(
  getCurrentUser: () => Promise<User>,
  accessToken = "tok-1",
): TokenAuthService {
  return {
    login: vi.fn(async () => ({ accessToken })),
    logout: vi.fn(async () => {}),
    getCurrentUser: vi.fn(getCurrentUser),
    requestPasswordReset: vi.fn(async () => {}),
    confirmPasswordReset: vi.fn(async () => {}),
    changePassword: vi.fn(async () => {}),
    linkMicrosoftAccount: vi.fn(async () => {}),
  };
}

function setup(authService: AuthService) {
  let store!: ReturnType<typeof useAuthStore>;
  mount(
    {
      setup() {
        store = useAuthStore();
        return () => null;
      },
    },
    {
      global: {
        plugins: [createPinia()],
        provide: { [AUTH_SERVICE_KEY as symbol]: authService },
      },
    },
  );
  return store;
}

describe("useAuthStore in session mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("authenticates after login without an access token", async () => {
    const service = createSessionAuthService(async () => {
      throw new Error("401");
    });
    const store = setup(service);
    await flushPromises();
    vi.mocked(service.getCurrentUser).mockResolvedValue(testUser);

    await store.login("bob", "pw");

    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(testUser);
    expect(service.getCurrentUser).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("restores the user on startup from the backend session", async () => {
    const store = setup(createSessionAuthService(async () => testUser));
    await flushPromises();

    expect(store.isAuthenticated).toBe(true);
    expect(store.isInitializing).toBe(false);
  });

  it("stays unauthenticated without erroring when there is no session", async () => {
    const service = createSessionAuthService(async () => {
      throw new Error("401");
    });
    const store = setup(service);
    await flushPromises();

    expect(store.isAuthenticated).toBe(false);
    expect(store.isInitializing).toBe(false);
    expect(service.logout).not.toHaveBeenCalled();
  });

  it("clears the user on logout", async () => {
    const service = createSessionAuthService(async () => testUser);
    const store = setup(service);
    await flushPromises();

    await store.logout();

    expect(service.logout).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it("can be re-initialized through the legacy alias", async () => {
    const service = createSessionAuthService(async () => testUser);
    const store = setup(service);
    await flushPromises();
    await store.logout();

    await store.initializeFromStorage();

    expect(store.isAuthenticated).toBe(true);
  });
});

describe("useAuthStore in token mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("rejects a login that returns no access token", async () => {
    const store = setup({
      login: vi.fn(async () => ({}) as { accessToken: string }),
      logout: vi.fn(async () => {}),
      getCurrentUser: vi.fn(async () => testUser),
      requestPasswordReset: vi.fn(async () => {}),
      confirmPasswordReset: vi.fn(async () => {}),
      changePassword: vi.fn(async () => {}),
      linkMicrosoftAccount: vi.fn(async () => {}),
    });

    await expect(store.login("bob", "pw")).rejects.toThrow(
      "No access token received",
    );
  });

  it("stores the token and hydrates the user on login", async () => {
    const service = createTokenAuthService(async () => testUser);
    const store = setup(service);

    await store.login("bob", "pw");

    expect(store.accessToken).toBe("tok-1");
    expect(localStorage.getItem("access_token")).toBe("tok-1");
    expect(store.isAuthenticated).toBe(true);
  });

  it("restores a stored token on startup", async () => {
    localStorage.setItem("access_token", "stored-token");
    const service = createTokenAuthService(async () => testUser);
    const store = setup(service);
    await flushPromises();

    expect(store.accessToken).toBe("stored-token");
    expect(store.isAuthenticated).toBe(true);
  });

  it("does not ask the backend for a user when nothing is stored", async () => {
    const service = createTokenAuthService(async () => testUser);
    const store = setup(service);
    await flushPromises();

    expect(service.getCurrentUser).not.toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
  });

  it("discards a stale stored token when the user cannot be loaded", async () => {
    localStorage.setItem("access_token", "stale-token");
    const service = createTokenAuthService(async () => {
      throw new Error("401");
    });
    const store = setup(service);
    await flushPromises();

    expect(store.isAuthenticated).toBe(false);
    expect(store.accessToken).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});
