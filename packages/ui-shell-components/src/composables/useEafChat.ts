import { inject, ref, type InjectionKey } from "vue";
import { z } from "zod";
import type {
  AiChatMessage,
  AiChatService,
  AiClientTool,
  AiConversation,
  AiModel,
  AiToolCall,
  AiToolResult,
  EafAiTool,
} from "../types";
import { eafScreenTools } from "./useEafAiTool";

/** Where `useEafChat` takes its `AiChatService` from - the host app or a module provides it */
export const AI_CHAT_SERVICE_KEY: InjectionKey<AiChatService> =
  Symbol("aiChatService");

function injectService(): AiChatService {
  const service = inject(AI_CHAT_SERVICE_KEY, null);
  if (!service) {
    throw new Error("No AiChatService provided under AI_CHAT_SERVICE_KEY.");
  }
  return service;
}

/** The tools `useEafChat` offers the model, asked again each round - the screen's when none are provided */
export const AI_CHAT_TOOLS_KEY: InjectionKey<() => EafAiTool[]> =
  Symbol("aiChatTools");

/** Runs a call; the result - or error - goes back to the model as JSON */
async function runTool(tools: EafAiTool[], call: AiToolCall): Promise<string> {
  try {
    const tool = tools.find((t) => t.name === call.name);
    if (!tool) {
      throw new Error(`There is no tool named ${call.name} now.`);
    }
    const args = (tool.parameters ?? noParameters).safeParse(
      JSON.parse(call.arguments || "{}"),
    );
    if (!args.success) {
      throw new Error(z.prettifyError(args.error));
    }
    const result = await tool.run(args.data);
    return JSON.stringify(result ?? null);
  } catch (error) {
    return JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** A tool's without its own - the models' APIs want an object schema all the same */
const noParameters = z.object({});

function jsonSchema(parameters: z.ZodObject): Record<string, unknown> {
  // As the model writes them - before defaults and transforms
  const schema = z.toJSONSchema(parameters, { io: "input" });
  // Some models' APIs turn down the keyword
  delete schema.$schema;
  return schema;
}

const offered = (tools: EafAiTool[]): AiClientTool[] =>
  tools.map<AiClientTool>(({ name, description, parameters }) => ({
    name,
    description,
    parameters: jsonSchema(parameters ?? noParameters),
  }));

/**
 * The user's conversations and the open conversation's messages, kept in step
 * with the `AiChatService`. Sending a message offers the model `tools()` -
 * asked again after each round, as what a tool did may have changed them - and
 * runs the calls it makes, until it replies.
 */
export function useEafChat(
  tools: () => EafAiTool[] = inject(AI_CHAT_TOOLS_KEY, eafScreenTools),
  service: AiChatService = injectService(),
) {
  const conversations = ref<AiConversation[]>([]);
  const activeId = ref<string | null>(null);
  const messages = ref<AiChatMessage[]>([]);
  const sending = ref(false);
  /** Empty without `canChangeModel` */
  const models = ref<AiModel[]>([]);
  const modelKey = ref<string | null>(null);

  async function loadModels(): Promise<void> {
    if (!service.canChangeModel || !service.getModels) return;
    models.value = await service.getModels();
    // Keeps the user's pick while the server still offers it
    if (!models.value.some((m) => m.modelKey === modelKey.value)) {
      modelKey.value = models.value[0]?.modelKey ?? null;
    }
  }

  async function load(): Promise<void> {
    const [list] = await Promise.all([
      service.getConversations(),
      loadModels(),
    ]);
    conversations.value = list;
  }

  async function open(id: string): Promise<void> {
    activeId.value = id;
    messages.value = await service.getMessages(id);
  }

  // Only clears the view - the server starts the conversation with its first message.
  function startNew(): void {
    activeId.value = null;
    messages.value = [];
  }

  /** The model's reply, after running the tool calls it makes first */
  async function reply(message: string) {
    // The one picked when sending, for the whole round
    const model = modelKey.value;
    let current = tools();
    let answer = await service.send({
      message,
      conversationId: activeId.value,
      clientTools: offered(current),
      modelKey: model,
    });

    while (answer.continuation !== null) {
      const results: AiToolResult[] = [];
      for (const call of answer.toolCalls) {
        results.push({
          toolCallId: call.id,
          result: await runTool(current, call),
        });
      }
      current = tools();
      answer = await service.sendToolResults({
        continuation: answer.continuation,
        results,
        clientTools: offered(current),
        modelKey: model,
      });
    }

    const { conversationId, conversationTitle, reply } = answer;
    if (conversationId === null || conversationTitle === null || !reply) {
      throw new Error("The AI chat's reply is incomplete.");
    }
    return { conversationId, conversationTitle, reply };
  }

  /** Shows the message straight away and takes it back out if sending fails, rethrowing the error. */
  async function send(message: string): Promise<void> {
    sending.value = true;
    const sent: AiChatMessage = {
      role: "User",
      content: message,
      sentAt: new Date().toISOString(),
    };
    messages.value.push(sent);

    try {
      const answer = await reply(message);
      const id = answer.conversationId;
      const title = answer.conversationTitle;
      messages.value.push(answer.reply);

      // Moves to the top: the list is newest first
      conversations.value = [
        { id, title, updatedAt: answer.reply.sentAt },
        ...conversations.value.filter((c) => c.id !== id),
      ];
      activeId.value = id;
    } catch (error) {
      // This message, not the last one - a conversation opened meanwhile replaces the list
      const index = messages.value.indexOf(sent);
      if (index !== -1) messages.value.splice(index, 1);
      throw error;
    } finally {
      sending.value = false;
    }
  }

  async function rename(
    conversation: AiConversation,
    title: string,
  ): Promise<void> {
    await service.rename(conversation.id, title);
    conversation.title = title;
  }

  async function remove(conversation: AiConversation): Promise<void> {
    await service.remove(conversation.id);
    conversations.value = conversations.value.filter(
      (c) => c.id !== conversation.id,
    );
    if (activeId.value === conversation.id) startNew();
  }

  return {
    conversations,
    activeId,
    messages,
    sending,
    models,
    modelKey,
    load,
    open,
    startNew,
    send,
    rename,
    remove,
  };
}
