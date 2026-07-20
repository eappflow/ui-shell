import { describe, it, expect, beforeEach } from "vitest";
import { useEafMessageStore } from "../useEafMessageStore";
import { createPinia, setActivePinia } from "pinia";
import { ToastMessage } from "@/types";

describe("useEafMessageStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should add message and clear from EafMessageStore", () => {
    const store = useEafMessageStore();
    const message: ToastMessage = {
      summary: "Test message summary",
      detail: "Test message detail",
      severity: "info",
    };

    store.addMessage(message);
    expect(store.messages.length).toBe(1);
    expect(store.messages[0]).toEqual(message);

    store.clearMessages();
    expect(store.messages.length).toBe(0);
  });
});
