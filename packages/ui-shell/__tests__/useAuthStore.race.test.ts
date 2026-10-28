import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../src/stores/useAuthStore";
import { AUTH_SERVICE_KEY, type AuthService } from "../src/services/interfaces";
import type { User } from "../src/types";

const user = {
  firstName: "A",
  lastName: "B",
  permissions: [],
} as unknown as User;

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(getCurrentUser: AuthService["getCurrentUser"]) {
  const service = {
    mode: "session",
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn(getCurrentUser),
  } as unknown as AuthService;

  const app = createApp({});
  const pinia = createPinia();
  app.use(pinia);
  app.provide(AUTH_SERVICE_KEY, service);
  setActivePinia(pinia);
  const store = app.runWithContext(() => useAuthStore());
  return { store, service };
}

describe("useAuthStore restoreSession races", () => {
  beforeEach(() => localStorage.clear());

  it("late 401 from the initial restore does not clear a user logged in meanwhile", async () => {
    const initial = deferred<User>();
    const { store, service } = setup(
      vi
        .fn<AuthService["getCurrentUser"]>()
        .mockReturnValueOnce(initial.promise)
        .mockResolvedValue(user),
    );
    await Promise.resolve(); // let the queued restoreSession() fire

    await store.login("a", "b"); // e.g. SSO return finishing first
    expect(store.user).toEqual(user);

    initial.reject(new Error("401"));
    await vi.waitFor(() => expect(store.isInitializing).toBe(false));

    expect(service.getCurrentUser).toHaveBeenCalledTimes(2);
    expect(store.user).toEqual(user);
  });

  it("late success from the initial restore does not resurrect a user after logout", async () => {
    const initial = deferred<User>();
    const { store } = setup(
      vi
        .fn<AuthService["getCurrentUser"]>()
        .mockReturnValueOnce(initial.promise),
    );
    await Promise.resolve();

    await store.logout();
    expect(store.user).toBeNull();

    initial.resolve(user);
    await vi.waitFor(() => expect(store.isInitializing).toBe(false));

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
