import type { z } from "zod";

/**
 * A tool the AI chat can call in the browser, e.g. to fill a form. Write one
 * with `defineEafAiTool`, which types `run`'s arguments by `parameters`.
 */
export interface EafAiTool<P extends z.ZodObject = z.ZodObject> {
  /** Letters, digits, `_` and `-` */
  name: string;
  /** Tells the model what the tool does and when to use it */
  description: string;
  /** The arguments - none without them. The model gets them as JSON schema, and what it writes is checked against them */
  parameters?: P;
  /** Gets the checked arguments; its result (or error) goes back to the model */
  run(args: z.output<P>): unknown;
}

export interface AiConversation {
  id: string;
  title: string;
  /** ISO 8601, of the last message - the history groups by it (Today, Yesterday...) */
  updatedAt: string;
}

export interface AiChatMessage {
  role: "User" | "Assistant";
  /** Markdown in the assistant's messages */
  content: string;
  /** ISO 8601 */
  sentAt: string;
}

/** A model the user can pick for the chat */
export interface AiModel {
  modelKey: string;
  modelName: string;
  /** Shown under the name in the picker's list */
  description?: string;
}

/** A tool the browser offers the model: an `EafAiTool` without its `run`, its parameters as JSON schema */
export interface AiClientTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AiToolCall {
  id: string;
  name: string;
  /** JSON, as the model wrote it */
  arguments: string;
}

export interface AiToolResult {
  toolCallId: string;
  /** JSON */
  result: string;
}

/**
 * The model's reply - or, with `continuation` set, the browser tools it waits
 * for. As loose as backends' generated types are; `useEafChat` checks it.
 */
export interface AiChatReply {
  /** `null` until a new conversation's first reply */
  conversationId: string | null;
  conversationTitle: string | null;
  reply: AiChatMessage | null;
  toolCalls: AiToolCall[];
  /** Sent back with the calls' results; `null` on the reply */
  continuation: string | null;
}

/** The AI chat's backend, which `useEafChat` talks to */
export interface AiChatService {
  /** Whether the chat shows a model picker, with `getModels`'s models */
  canChangeModel?: boolean;

  /** The models to pick from, the default first - needed with `canChangeModel` */
  getModels?(): Promise<AiModel[]>;

  /** The user's conversations, newest first */
  getConversations(): Promise<AiConversation[]>;

  getMessages(conversationId: string): Promise<AiChatMessage[]>;

  /** Sends a message; without a `conversationId` a new conversation starts */
  send(request: {
    message: string;
    conversationId: string | null;
    clientTools: AiClientTool[];
    /** The picked model; `null` without `canChangeModel` - the server's default */
    modelKey: string | null;
  }): Promise<AiChatReply>;

  /** Answers a reply's tool calls, one result each, and gets what follows */
  sendToolResults(request: {
    continuation: string;
    results: AiToolResult[];
    clientTools: AiClientTool[];
    modelKey: string | null;
  }): Promise<AiChatReply>;

  rename(conversationId: string, title: string): Promise<void>;

  remove(conversationId: string): Promise<void>;
}
