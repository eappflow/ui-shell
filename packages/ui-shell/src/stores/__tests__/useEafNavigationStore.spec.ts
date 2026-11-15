import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { useEafNavigationStore } from "../useEafNavigationStore";
import { useAuthStore } from "../useAuthStore";
import {
  AUTH_SERVICE_KEY,
  type SessionAuthService,
} from "../../services/interfaces";
import type { EafMenuItem, EafMenuSource, User } from "../../types";

const bob: User = {
  id: "1",
  login: "bob",
  firstName: "Bob",
  lastName: "Builder",
  permissions: ["Dashboard"],
};
const alice: User = { ...bob, id: "2", login: "alice" };

function authService(user: User): SessionAuthService {
  return {
    mode: "session",
    login: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    getCurrentUser: vi.fn(async () => user),
    requestPasswordReset: vi.fn(async () => {}),
    confirmPasswordReset: vi.fn(async () => {}),
    changePassword: vi.fn(async () => {}),
    linkMicrosoftAccount: vi.fn(async () => {}),
  };
}

function item(name: string): EafMenuItem {
  return { name, path: `/dashboards/${name}` };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

async function setup(source: EafMenuSource, user: User = bob) {
  let navigation!: ReturnType<typeof useEafNavigationStore>;
  let auth!: ReturnType<typeof useAuthStore>;
  mount(
    {
      setup() {
        auth = useAuthStore();
        navigation = useEafNavigationStore();
        navigation.setMenuModules([
          { name: "Dashboards", icon: "", items: [item("my-day")] },
        ]);
        navigation.setMenuSources([{ moduleId: "administration", source }]);
        return () => null;
      },
    },
    {
      global: {
        plugins: [createPinia()],
        provide: { [AUTH_SERVICE_KEY as symbol]: authService(user) },
      },
    },
  );
  await flushPromises();
  return { navigation, auth };
}

const names = (navigation: ReturnType<typeof useEafNavigationStore>) =>
  navigation.menuModules[0].items.map((i) => i.name);

describe("useEafNavigationStore menu sources", () => {
  it("adds a signed-in user's items after their group's own", async () => {
    const { navigation } = await setup({
      group: "Dashboards",
      load: async () => [item("sales")],
    });

    expect(names(navigation)).toEqual(["my-day", "sales"]);
  });

  it("translates an item's nameKey in its module's messages, like the module's other items", async () => {
    const { navigation } = await setup({
      group: "Dashboards",
      load: async () => [
        { name: "New dashboard", nameKey: "new_dashboard", path: "/new" },
      ],
    });

    expect(navigation.menuModules[0].items[1].nameKey).toBe(
      "menu.administration.new_dashboard",
    );
  });

  it("doesn't load for a user without the source's permissions", async () => {
    const load = vi.fn(async () => [item("sales")]);
    const { navigation } = await setup({
      group: "Dashboards",
      permissions: ["Admin"],
      load,
    });

    expect(load).not.toHaveBeenCalled();
    expect(names(navigation)).toEqual(["my-day"]);
  });

  it("drops the items on sign-out, and the previous user's late answer", async () => {
    const answers = [deferred<EafMenuItem[]>(), deferred<EafMenuItem[]>()];
    let call = 0;
    const { navigation, auth } = await setup({
      group: "Dashboards",
      load: () => answers[call++].promise,
    });

    auth.user = alice;
    await flushPromises();
    answers[1].resolve([item("alice's")]);
    answers[0].resolve([item("bob's")]);
    await flushPromises();
    expect(names(navigation)).toEqual(["my-day", "alice's"]);

    auth.user = null;
    await flushPromises();
    expect(names(navigation)).toEqual(["my-day"]);
  });

  it("hides the previous user's items while the next user's load", async () => {
    const alices = deferred<EafMenuItem[]>();
    let signedIn = bob;
    const { navigation, auth } = await setup({
      group: "Dashboards",
      load: () =>
        signedIn === alice ? alices.promise : Promise.resolve([item("bob's")]),
    });
    expect(names(navigation)).toEqual(["my-day", "bob's"]);

    signedIn = alice;
    auth.user = alice;
    await flushPromises();

    expect(names(navigation)).toEqual(["my-day"]);
  });

  it("keeps the items while reloading, and the newest reload's answer", async () => {
    const answers = [
      deferred<EafMenuItem[]>(),
      deferred<EafMenuItem[]>(),
      deferred<EafMenuItem[]>(),
    ];
    let call = 0;
    const source: EafMenuSource = {
      group: "Dashboards",
      load: () => answers[call++].promise,
    };
    const { navigation } = await setup(source);
    answers[0].resolve([item("sales")]);
    await flushPromises();

    const older = navigation.reloadMenuSource(source);
    const newer = navigation.reloadMenuSource(source);
    expect(names(navigation)).toEqual(["my-day", "sales"]);
    expect(navigation.loadingMenuSources).toBe(true);

    answers[2].resolve([item("sales Q4")]);
    answers[1].resolve([item("sales")]);
    await Promise.all([older, newer]);
    expect(names(navigation)).toEqual(["my-day", "sales Q4"]);
    expect(navigation.loadingMenuSources).toBe(false);
  });

  it("refuses to reload a source no module registered", async () => {
    const { navigation } = await setup({
      group: "Dashboards",
      load: async () => [],
    });

    await expect(
      navigation.reloadMenuSource({
        group: "Dashboards",
        load: async () => [],
      }),
    ).rejects.toThrow("isn't in any module's menuSources");
  });
});
