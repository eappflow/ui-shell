import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMenuPreferencesStore } from "../src/stores/useMenuPreferencesStore";

describe("useMenuPreferencesStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("toggles a pin on and off", () => {
    const store = useMenuPreferencesStore();
    store.togglePin("/orders");
    expect(store.isPinned("/orders")).toBe(true);
    store.togglePin("/orders");
    expect(store.isPinned("/orders")).toBe(false);
  });

  it("toggles a group collapsed state", () => {
    const store = useMenuPreferencesStore();
    store.toggleGroup("G");
    expect(store.isCollapsed("G")).toBe(true);
    store.toggleGroup("G");
    expect(store.isCollapsed("G")).toBe(false);
  });
});
