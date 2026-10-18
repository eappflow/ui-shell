# AI Assistant

The shell has an AI chat: a panel in the layout and an optional full page. It
does not call a model itself. Your backend does, and the shell talks to it
through an `AiChatService` that you provide.

## Turn it on

Provide the service under `AI_CHAT_SERVICE_KEY`, e.g. in a module's `install`.
The chat panel shows once the service is there. For the full page, add a route
with `EafAiChatView`:

```ts
import {
  AI_CHAT_SERVICE_KEY,
  EafAiChatView,
  type EafModule,
} from "@eappflow/ui-shell";

const aiModule: EafModule = {
  id: "ai",
  name: "AI",
  routes: [{ path: "ai-chat", name: "ai-chat", component: EafAiChatView }],
  install(app) {
    app.provide(AI_CHAT_SERVICE_KEY, createAiChatService());
  },
};
```

## The service

`AiChatService` keeps the conversations (`getConversations`, `getMessages`,
`rename`, `remove`) and sends messages (`send`). With `canChangeModel` and
`getModels`, the user can pick the model.

The demo's
[fake service](https://github.com/eappflow/ui-shell/blob/main/apps/demo/src/services/fakeAiChatService.ts)
implements all of it.

## Tools

Tools let the chat do things in the app, not only talk about them. A tool
runs in the browser: the model asks for it, the chat runs it, and the result
goes back to the model.

### Built-in tools

- `navigate`: opens a page from the user's menu.
- `get_forms` and `fill_form`: read and fill the [forms](./forms.md) on screen.
  The AI never submits a form; the user does.

### A tool for one screen

Say the orders page has a status filter. With `useEafAiTool`, the chat can
set that filter for the user:

```vue
<!-- src/views/OrdersView.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { defineEafAiTool, useEafAiTool } from "@eappflow/ui-shell-components";

const status = ref<"new" | "paid" | "shipped" | null>(null);
const orders = ref<Order[]>([]);

async function loadOrders() {
  orders.value = await api.getOrders({ status: status.value });
}

useEafAiTool(
  defineEafAiTool({
    name: "filter_orders",
    description: "Filters the orders list on the user's screen by status.",
    parameters: z.object({
      status: z
        .enum(["new", "paid", "shipped"])
        .nullable()
        .describe("null shows all orders"),
    }),
    async run(args) {
      status.value = args.status;
      await loadOrders();
      // What the model gets back, to answer the user
      return orders.value.map(({ number, customer, total }) => ({
        number,
        customer,
        total,
      }));
    },
  }),
);
</script>
```

The user is on the dashboard and writes "show me the paid orders":

1. The model calls `navigate` with `/orders`, and the orders page opens.
2. The page is now on screen, so the chat offers `filter_orders` too.
3. The model calls `filter_orders` with `{ "status": "paid" }`. The list
   changes in front of the user.
4. The model gets the paid orders back and answers, e.g. "There are 3 paid
   orders, the biggest is #1042 for 1 200 PLN."

The tool is offered only while the page is open. When the user leaves it, the
chat stops seeing it.

`parameters` is a Zod schema: the model gets it as JSON schema, and the chat
checks the arguments against it before `run`. If `run` throws, the error goes
back to the model, so it can tell the user or try again.

### A tool for the whole app

A tool that works on every page goes into a module's `aiTools` (or the
plugin's `aiTools`). With `permissions`, only users who have one of them get
it:

```ts
const findOrder = defineEafAiTool({
  name: "find_order",
  description: "Finds an order by its number.",
  parameters: z.object({ number: z.string() }),
  run: ({ number }) => api.getOrder(number),
});

const ordersModule: EafModule = {
  id: "orders",
  // ...
  aiTools: [{ ...findOrder, permissions: ["Orders"] }],
};
```
