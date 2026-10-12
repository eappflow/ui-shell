---
"@eappflow/ui-shell": minor
"@eappflow/ui-shell-components": minor
---

AI chat: provide an `AiChatService` under `AI_CHAT_SERVICE_KEY` for the chat panel, `EafAiChatView` gives it a full page. Its tools fill the forms on screen (`exposeToAi`), open app pages, and run what screens (`useEafAiTool`) and modules (`aiTools`) add, with zod arguments. `canChangeModel` with `getModels()` adds a model picker.
