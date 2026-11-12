import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { useUserPreferencesStore } from "../useUserPreferencesStore";
import {
  AUTH_SERVICE_KEY,
  USER_PREFERENCES_SERVICE_KEY,
  type SessionAuthService,
  type UserPreferencesService,
} from "../../services/interfaces";

const authService: SessionAuthService = {
  mode: "session",
  login: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  getCurrentUser: vi.fn(async () => ({
    id: "1",
    login: "bob",
    firstName: "Bob",
    lastName: "Builder",
    permissions: [],
  })),
  requestPasswordReset: vi.fn(async () => {}),
  confirmPasswordReset: vi.fn(async () => {}),
  changePassword: vi.fn(async () => {}),
  linkMicrosoftAccount: vi.fn(async () => {}),
};

async function setup(get: UserPreferencesService["get"]) {
  const service = { get: vi.fn(get), save: vi.fn(async () => {}) };
  let store!: ReturnType<typeof useUserPreferencesStore>;
  mount(
    {
      setup() {
        store = useUserPreferencesStore();
        return () => null;
      },
    },
    {
      global: {
        plugins: [createPinia()],
        provide: {
          [AUTH_SERVICE_KEY as symbol]: authService,
          [USER_PREFERENCES_SERVICE_KEY as symbol]: service,
        },
        // A failed load's error - the host's service reports it
        config: { errorHandler: () => {} },
      },
    },
  );
  await flushPromises();
  return { store, service };
}

describe("useUserPreferencesStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves a change once the saved preferences are loaded", async () => {
    const { store, service } = await setup(async () => ({
      pinnedPages: ["/units"],
    }));

    store.togglePin("/crm");
    await flushPromises();

    expect(service.save).toHaveBeenCalledWith({
      pinnedPages: ["/units", "/crm"],
    });
  });

  it("doesn't overwrite the saved preferences after failing to load them", async () => {
    const { store, service } = await setup(async () => {
      throw new Error("503");
    });

    store.togglePin("/crm");
    await flushPromises();

    expect(store.pinnedPages).toEqual(["/crm"]);
    expect(service.save).not.toHaveBeenCalled();
  });
});
