import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, type EffectScope } from "vue";
import { z } from "zod";
import { useEafChat } from "../useEafChat";
import { useEafAiTool } from "../useEafAiTool";
import type {
  AiChatMessage,
  AiChatReply,
  AiChatService,
  AiConversation,
  EafAiTool,
} from "../../types";

const sentAt = "2026-10-05T10:00:00Z";

const done = (content: string): AiChatReply => ({
  conversationId: "new",
  conversationTitle: "Hello",
  reply: { role: "Assistant", content, sentAt },
  toolCalls: [],
  continuation: null,
});

const offers = new Map<EafAiTool, EffectScope>();
afterEach(() => {
  offers.forEach((scope) => scope.stop());
  offers.clear();
});

/** Offers the tool as a screen does, until `takeBack` - as its leaving does */
function offer(tool: EafAiTool) {
  const scope = effectScope();
  scope.run(() => useEafAiTool(tool));
  offers.set(tool, scope);
}
const takeBack = (tool: EafAiTool) => offers.get(tool)?.stop();

function setup(conversations: AiConversation[] = [], tools: EafAiTool[] = []) {
  tools.forEach(offer);
  const service = {
    getConversations: vi.fn().mockResolvedValue(conversations),
    getMessages: vi.fn().mockResolvedValue([]),
    send: vi.fn<AiChatService["send"]>(),
    sendToolResults: vi.fn<AiChatService["sendToolResults"]>(),
    rename: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  return { service, chat: useEafChat(service) };
}

describe("useEafChat", () => {
  it("lists the conversation the server started for a message sent from an empty chat", async () => {
    const { service, chat } = setup([
      { id: "older", title: "Older", updatedAt: sentAt },
    ]);
    await chat.load();
    service.send.mockResolvedValue(done("Hi!"));

    const sending = chat.send("Hello");
    expect(chat.sending.value).toBe(true);
    await sending;

    expect(chat.sending.value).toBe(false);
    expect(service.send).toHaveBeenCalledWith({
      message: "Hello",
      conversationId: null,
      clientTools: [],
      modelKey: null,
    });
    expect(chat.messages.value.map((m) => `${m.role}: ${m.content}`)).toEqual([
      "User: Hello",
      "Assistant: Hi!",
    ]);
    expect(chat.conversations.value.map((c) => c.id)).toEqual(["new", "older"]);
    expect(chat.activeId.value).toBe("new");
  });

  it("moves a conversation that gets a reply to the top, dated by the reply", async () => {
    const { service, chat } = setup([
      { id: "a", title: "A", updatedAt: "2026-10-04T10:00:00Z" },
      { id: "b", title: "B", updatedAt: "2026-10-01T10:00:00Z" },
    ]);
    await chat.load();
    await chat.open("b");
    service.send.mockResolvedValue({ ...done("Hi!"), conversationId: "b" });

    await chat.send("Hello");

    expect(chat.conversations.value).toEqual([
      { id: "b", title: "Hello", updatedAt: sentAt },
      { id: "a", title: "A", updatedAt: "2026-10-04T10:00:00Z" },
    ]);
  });

  it("runs the tools the model calls and sends their results back until it replies", async () => {
    const fill: EafAiTool = {
      name: "fill_form",
      description: "Fills the form.",
      parameters: z.object({ name: z.string().describe("Who") }),
      run: vi.fn(({ name }) => ({ filled: name })),
    };
    const { service, chat } = setup([], [fill]);
    service.send.mockResolvedValue({
      ...done(""),
      conversationId: null,
      reply: null,
      toolCalls: [
        { id: "1", name: "fill_form", arguments: '{"name":"Anna"}' },
        { id: "2", name: "missing", arguments: "{}" },
        { id: "3", name: "fill_form", arguments: "not json" },
        { id: "4", name: "fill_form", arguments: "[1]" },
        { id: "5", name: "fill_form", arguments: '{"name":1}' },
      ],
      continuation: "turn",
    });
    service.sendToolResults.mockResolvedValue(done("Filled in."));

    await chat.send("Fill it with Anna");

    const offered = [
      {
        name: "fill_form",
        description: "Fills the form.",
        // JSON schema, without $schema
        parameters: {
          type: "object",
          properties: { name: { type: "string", description: "Who" } },
          required: ["name"],
        },
      },
    ];
    expect(service.send.mock.calls[0]![0].clientTools).toEqual(offered);
    // Only with arguments that fit its parameters
    expect(fill.run).toHaveBeenCalledOnce();
    expect(fill.run).toHaveBeenCalledWith({ name: "Anna" });
    expect(service.sendToolResults).toHaveBeenCalledWith({
      continuation: "turn",
      results: [
        { toolCallId: "1", result: '{"filled":"Anna"}' },
        {
          toolCallId: "2",
          result: '{"error":"There is no tool named missing now."}',
        },
        { toolCallId: "3", result: expect.stringContaining('{"error":') },
        { toolCallId: "4", result: expect.stringContaining("expected object") },
        { toolCallId: "5", result: expect.stringContaining("at name") },
      ],
      clientTools: offered,
      modelKey: null,
    });
    expect(chat.messages.value.at(-1)?.content).toBe("Filled in.");
  });

  it("turns down a call to a tool taken back since it was offered", async () => {
    const tool = (
      name: string,
      run: () => unknown = () => null,
    ): EafAiTool => ({
      name,
      description: `${name}.`,
      run: vi.fn(run),
    });
    const old = tool("old");
    // The next screen's, of the same name
    const next = tool("old");
    const leave = tool("leave", () => {
      takeBack(old);
      offer(next);
    });
    const gone = tool("gone");
    const { service, chat } = setup([], [leave, old, gone]);
    let answer!: (reply: AiChatReply) => void;
    service.send.mockReturnValue(new Promise((resolve) => (answer = resolve)));
    service.sendToolResults.mockResolvedValue(done("Done."));

    const sending = chat.send("Go");
    // Taken back while the request is out
    takeBack(gone);
    answer({
      ...done(""),
      reply: null,
      toolCalls: ["gone", "leave", "old"].map((name, i) => ({
        id: String(i + 1),
        name,
        arguments: "{}",
      })),
      continuation: "turn",
    });
    await sending;

    expect(gone.run).not.toHaveBeenCalled();
    expect(old.run).not.toHaveBeenCalled();
    expect(next.run).not.toHaveBeenCalled();
    expect(service.sendToolResults.mock.calls[0]![0].results).toEqual([
      {
        toolCallId: "1",
        result: '{"error":"There is no tool named gone now."}',
      },
      { toolCallId: "2", result: expect.any(String) },
      {
        toolCallId: "3",
        result: '{"error":"There is no tool named old now."}',
      },
    ]);
  });

  it("offers a tool without parameters as taking none", async () => {
    const now: EafAiTool = {
      name: "now",
      description: "The time.",
      run: vi.fn(() => "noon"),
    };
    const { service, chat } = setup([], [now]);
    service.send.mockResolvedValue({
      ...done(""),
      reply: null,
      toolCalls: [{ id: "1", name: "now", arguments: "" }],
      continuation: "turn",
    });
    service.sendToolResults.mockResolvedValue(done("It's noon."));

    await chat.send("What time is it?");

    expect(service.send.mock.calls[0]![0].clientTools[0]!.parameters).toEqual({
      type: "object",
      properties: {},
    });
    expect(now.run).toHaveBeenCalledWith({});
  });

  it("sends the picked model, the first one to start with", async () => {
    const { service, chat } = setup();
    const models = [
      { modelKey: "fast", modelName: "Fast" },
      { modelKey: "smart", modelName: "Smart" },
    ];
    Object.assign(service, {
      canChangeModel: true,
      getModels: vi.fn().mockResolvedValue(models),
    });
    service.send.mockResolvedValue(done("Hi!"));

    await chat.load();
    expect(chat.models.value).toEqual(models);
    expect(chat.modelKey.value).toBe("fast");

    chat.modelKey.value = "smart";
    await chat.load();
    await chat.send("Hello");

    expect(chat.modelKey.value).toBe("smart");
    expect(service.send.mock.calls[0]![0].modelKey).toBe("smart");
  });

  it("takes the message back out and rethrows when sending fails", async () => {
    const { service, chat } = setup();
    const failure = new Error("500");
    service.send.mockRejectedValue(failure);

    await expect(chat.send("Hello")).rejects.toBe(failure);

    expect(chat.messages.value).toEqual([]);
    expect(chat.conversations.value).toEqual([]);
  });

  it("turns down a reply without its message", async () => {
    const { service, chat } = setup();
    service.send.mockResolvedValue({ ...done(""), reply: null });

    await expect(chat.send("Hello")).rejects.toThrow("incomplete");
    expect(chat.messages.value).toEqual([]);
  });

  it("takes back only its own message when a conversation opened meanwhile", async () => {
    const { service, chat } = setup();
    const older: AiChatMessage = {
      role: "Assistant",
      content: "Older",
      sentAt,
    };
    service.getMessages.mockResolvedValue([older]);
    let fail!: (error: Error) => void;
    service.send.mockReturnValue(new Promise((_, reject) => (fail = reject)));

    const sending = chat.send("Hello");
    await chat.open("a");
    fail(new Error("500"));

    await expect(sending).rejects.toThrow("500");
    expect(chat.messages.value).toEqual([older]);
  });

  it("shows the conversation picked last, whatever order the histories come back in", async () => {
    const { service, chat } = setup();
    const history = (content: string): AiChatMessage[] => [
      { role: "Assistant", content, sentAt },
    ];
    let answerA!: (messages: AiChatMessage[]) => void;
    let answerB!: (messages: AiChatMessage[]) => void;
    service.getMessages
      .mockReturnValueOnce(new Promise((resolve) => (answerA = resolve)))
      .mockReturnValueOnce(new Promise((resolve) => (answerB = resolve)));

    const openingA = chat.open("a");
    const openingB = chat.open("b");
    expect(chat.loading.value).toBe(true);
    answerB(history("B"));
    await openingB;
    answerA(history("A"));
    await openingA;

    expect(chat.activeId.value).toBe("b");
    expect(chat.messages.value).toEqual(history("B"));
    expect(chat.loading.value).toBe(false);
  });

  it("keeps a history that comes late out of a new conversation", async () => {
    const { service, chat } = setup();
    let answer!: (messages: AiChatMessage[]) => void;
    service.getMessages.mockReturnValue(
      new Promise((resolve) => (answer = resolve)),
    );
    service.send.mockResolvedValue(done("Hi!"));

    const opening = chat.open("a");
    chat.startNew();
    expect(chat.loading.value).toBe(false);
    await chat.send("Hello");
    answer([{ role: "Assistant", content: "Older", sentAt }]);
    await opening;

    expect(chat.activeId.value).toBe("new");
    expect(chat.messages.value.map((m) => m.content)).toEqual(["Hello", "Hi!"]);
  });

  it("stays on a conversation opened while a reply was on its way", async () => {
    const { service, chat } = setup();
    const older: AiChatMessage[] = [
      { role: "Assistant", content: "Older", sentAt },
    ];
    let answerSend!: (reply: AiChatReply) => void;
    let answerA!: (messages: AiChatMessage[]) => void;
    service.send.mockReturnValue(
      new Promise((resolve) => (answerSend = resolve)),
    );
    service.getMessages.mockReturnValue(
      new Promise((resolve) => (answerA = resolve)),
    );

    const sending = chat.send("Hello");
    const opening = chat.open("a");
    answerSend(done("Hi!"));
    await sending;
    answerA(older);
    await opening;

    expect(chat.activeId.value).toBe("a");
    expect(chat.messages.value).toEqual(older);
    expect(chat.loading.value).toBe(false);
    expect(chat.conversations.value.map((c) => c.id)).toEqual(["new"]);
  });

  it("clears the view when the open conversation is deleted", async () => {
    const { chat } = setup([{ id: "a", title: "A", updatedAt: sentAt }]);
    await chat.load();
    await chat.open("a");

    await chat.remove(chat.conversations.value[0]!);

    expect(chat.conversations.value).toEqual([]);
    expect(chat.activeId.value).toBeNull();
  });
});
