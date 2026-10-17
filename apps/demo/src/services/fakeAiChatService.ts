/**
 * Fake AI Chat Service - Demo implementation
 *
 * Implements the AiChatService interface from @eappflow/ui-shell without a
 * model: conversations live in memory, and asked to fill in a form it calls
 * the browser's form tools (get_forms, then fill_form) as a real model would.
 */
import type {
  AiChatMessage,
  AiChatReply,
  AiChatService,
} from "@eappflow/ui-shell";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: AiChatMessage[];
}

// For the dashboard's form
const SAMPLE_VALUES = {
  name: "Anna Kowalska",
  "company.name": "Acme sp. z o.o.",
  "company.taxId": "1234567890",
  // The whole list, so it replaces the addresses already there
  addresses: [
    { street: "Floriańska 1", city: "Kraków", zipCode: "31-019" },
    { street: "Długa 5", city: "Gdańsk", zipCode: "80-827" },
  ],
};

const delay = () => new Promise((r) => setTimeout(r, 600));

const DEFAULT_REPLY =
  "I'm the demo assistant, with no model behind me. Ask me to **fill in the form** on the [dashboard](/), or to **go to** a page.";

// Earlier conversations, so the history shows its groups (Yesterday, Previous 7 days...)
function earlier(title: string, days: number): Conversation {
  const sentAt = new Date(Date.now() - days * 86_400_000).toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    updatedAt: sentAt,
    messages: [
      { role: "User", content: title, sentAt },
      { role: "Assistant", content: DEFAULT_REPLY, sentAt },
    ],
  };
}

export function createFakeAiChatService(): AiChatService {
  const conversations: Conversation[] = [
    earlier("Fill in the dashboard form", 1),
    earlier("Show the dashboard stats", 4),
    earlier("What time is it?", 12),
    earlier("Hello", 45),
  ];
  const find = (id: string) => conversations.find((c) => c.id === id)!;

  function say(conversation: Conversation, content: string): AiChatReply {
    const reply: AiChatMessage = {
      role: "Assistant",
      content,
      sentAt: new Date().toISOString(),
    };
    conversation.messages.push(reply);
    conversation.updatedAt = reply.sentAt;
    return {
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      reply,
      toolCalls: [],
      continuation: null,
    };
  }

  // The call's id is the tool's name, so its result tells the next step
  function call(
    conversation: Conversation,
    name: string,
    args: object,
  ): AiChatReply {
    return {
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      reply: null,
      toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }],
      continuation: conversation.id,
    };
  }

  return {
    canChangeModel: true,

    async getModels() {
      return [
        {
          modelKey: "gpt-5-mini",
          modelName: "GPT-5 mini",
          description: "Quick answers to everyday questions.",
        },
        { modelKey: "gpt-5", modelName: "GPT-5" },
      ];
    },

    async getConversations() {
      return conversations.map(({ id, title, updatedAt }) => ({
        id,
        title,
        updatedAt,
      }));
    },

    // A copy - the chat adds its own messages to what it gets
    async getMessages(id) {
      return [...find(id).messages];
    },

    async send({ message, conversationId, clientTools }) {
      await delay();
      let conversation = conversationId ? find(conversationId) : undefined;
      if (conversation) {
        // To the top: the list is newest first
        conversations.splice(conversations.indexOf(conversation), 1);
      } else {
        conversation = {
          id: crypto.randomUUID(),
          title: message,
          updatedAt: new Date().toISOString(),
          messages: [],
        };
      }
      conversations.unshift(conversation);
      conversation.messages.push({
        role: "User",
        content: message,
        sentAt: new Date().toISOString(),
      });

      const offered = (name: string) =>
        clientTools.some((tool) => tool.name === name);
      // The screen's tools (see Dashboard.vue), offered while it is open
      if (
        /random|losuj/i.test(message) &&
        offered("randomize_dashboard_stats")
      ) {
        return call(conversation, "randomize_dashboard_stats", {});
      }
      if (/stat/i.test(message) && offered("get_dashboard_stats")) {
        return call(conversation, "get_dashboard_stats", {});
      }
      // A module's tool (see main.ts), offered for the user's permissions
      if (/time|godzin/i.test(message) && offered("current_time")) {
        return call(conversation, "current_time", {});
      }
      // The shell's own, offered off the chat's page
      if (/go to|przejdź/i.test(message) && offered("navigate")) {
        const path = /diagnost/i.test(message) ? "/diagnostics" : "/";
        return call(conversation, "navigate", { path });
      }
      // The chat offers get_forms only while a form is on screen
      if (/fill|wypełnij/i.test(message) && offered("get_forms")) {
        return call(conversation, "get_forms", {});
      }
      return say(conversation, DEFAULT_REPLY);
    },

    async sendToolResults({ continuation, results: [result], clientTools }) {
      await delay();
      const conversation = find(continuation);
      if (result?.toolCallId === "navigate") {
        // "Go to the dashboard and fill in the form": its form is on screen now
        const asked = conversation.messages.at(-1)!.content;
        if (
          /fill|wypełnij/i.test(asked) &&
          clientTools.some((tool) => tool.name === "get_forms")
        ) {
          return call(conversation, "get_forms", {});
        }
        const { currentPage } = JSON.parse(result.result);
        return say(conversation, `Here you are, at \`${currentPage}\`.`);
      }
      if (result?.toolCallId === "get_forms") {
        const [form] = JSON.parse(result.result);
        return call(conversation, "fill_form", {
          form: form.form,
          values: SAMPLE_VALUES,
        });
      }
      if (
        result?.toolCallId === "get_dashboard_stats" ||
        result?.toolCallId === "randomize_dashboard_stats"
      ) {
        const stats: { label: string; value: string }[] = JSON.parse(
          result.result,
        );
        return say(
          conversation,
          stats.map((s) => `- **${s.label}:** ${s.value}`).join("\n"),
        );
      }
      if (result?.toolCallId === "current_time") {
        return say(conversation, `It's ${JSON.parse(result.result)}.`);
      }
      return say(conversation, "Done - **review the form and save** it.");
    },

    async rename(id, title) {
      find(id).title = title;
    },

    async remove(id) {
      conversations.splice(conversations.indexOf(find(id)), 1);
    },
  };
}
