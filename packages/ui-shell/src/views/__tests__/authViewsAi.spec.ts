import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, type Component } from "vue";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import ToastService from "primevue/toastservice";
import { z } from "zod";
import {
  useEafChat,
  useEafForm,
  type AiChatService,
} from "@eappflow/ui-shell-components";
import { createEafI18n } from "../../composables/createEafI18n";
import LoginView from "../LoginView.vue";
import ChangePasswordView from "../ChangePasswordView.vue";
import RecoverPasswordView from "../RecoverPasswordView.vue";
import RestorePasswordView from "../RestorePasswordView.vue";

let mounted: VueWrapper | undefined;
afterEach(() => mounted?.unmount());

/** The names of the tools the AI chat offers the model while `view` is on screen */
async function toolsOfferedWith(view: Component): Promise<string[]> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:path(.*)*", component: { render: () => null } }],
  });
  mounted = shallowMount(view, {
    global: {
      plugins: [createPinia(), router, ToastService, createEafI18n([]).i18n],
    },
  });
  const service = {
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    send: vi.fn<AiChatService["send"]>().mockResolvedValue({
      conversationId: "c",
      conversationTitle: "C",
      reply: {
        role: "Assistant",
        content: "Hi",
        sentAt: "2026-10-17T10:00:00Z",
      },
      toolCalls: [],
      continuation: null,
    }),
    sendToolResults: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
  };
  await useEafChat(service).send("Hello");
  return service.send.mock.calls[0]![0].clientTools.map((tool) => tool.name);
}

describe("the auth views and the AI chat", () => {
  it("offers a form's tools for a form not opted out - the check below can fail", async () => {
    const Exposed = defineComponent({
      setup() {
        useEafForm({ schema: z.object({ password: z.string() }) });
        return () => null;
      },
    });

    expect(await toolsOfferedWith(Exposed)).toContain("get_forms");
  });

  it.each([
    ["LoginView", LoginView],
    ["ChangePasswordView", ChangePasswordView],
    ["RecoverPasswordView", RecoverPasswordView],
    ["RestorePasswordView", RestorePasswordView],
  ])(
    "offers no tool to read or fill %s's form - its passwords stay out of the chat",
    async (_, view) => {
      expect(await toolsOfferedWith(view)).toEqual([]);
    },
  );
});
