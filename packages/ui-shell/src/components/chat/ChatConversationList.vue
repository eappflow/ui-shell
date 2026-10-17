<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import { useConfirm } from "primevue/useconfirm";
import type { MenuItem } from "primevue/menuitem";
import type { AiConversation } from "../../types";
import { useScopedI18n } from "../../composables/useScopedI18n";
import { daysAgo } from "../../utils/daysAgo";

const props = defineProps<{
  conversations: AiConversation[];
  activeId: string | null;
  disabled: boolean;
}>();
const emit = defineEmits<{
  select: [id: string];
  new: [];
  rename: [conversation: AiConversation, title: string];
  remove: [conversation: AiConversation];
}>();

const { t } = useScopedI18n();
const confirm = useConfirm();

const menu = ref<InstanceType<typeof Menu>>();
const menuItems = ref<MenuItem[]>([]);
const renamingId = ref<string | null>(null);
const renameDraft = ref("");

const vFocus = { mounted: (el: HTMLElement) => el.focus() };

function groupLabel(updatedAt: string, now: Date): string {
  const days = daysAgo(updatedAt, now);
  if (days < 1) return t("chat_today", "Today", "Dzisiaj");
  if (days < 2) return t("chat_yesterday", "Yesterday", "Wczoraj");
  if (days < 7)
    return t("chat_previous_7_days", "Previous 7 days", "Poprzednie 7 dni");
  if (days < 30)
    return t("chat_previous_30_days", "Previous 30 days", "Poprzednie 30 dni");
  return t("chat_older", "Older", "Starsze");
}

// The list comes newest first, so each group is a run of it
const groups = computed(() => {
  const now = new Date();
  const result: { label: string; conversations: AiConversation[] }[] = [];
  for (const c of props.conversations) {
    const label = groupLabel(c.updatedAt, now);
    const last = result.at(-1);
    if (last?.label === label) last.conversations.push(c);
    else result.push({ label, conversations: [c] });
  }
  return result;
});

function openMenu(event: Event, conversation: AiConversation) {
  menuItems.value = [
    {
      label: t("chat_rename", "Rename", "Zmień nazwę"),
      icon: "pi pi-pencil",
      command: () => startRename(conversation),
    },
    {
      label: t("chat_delete", "Delete", "Usuń"),
      icon: "pi pi-trash",
      command: () => confirmRemove(conversation),
    },
  ];
  menu.value?.toggle(event);
}

function startRename(conversation: AiConversation) {
  renameDraft.value = conversation.title;
  renamingId.value = conversation.id;
}

function finishRename(conversation: AiConversation) {
  // Enter saves and removes the input, which then also fires blur - only the first one counts.
  if (renamingId.value !== conversation.id) return;
  renamingId.value = null;

  const title = renameDraft.value.trim();
  if (title && title !== conversation.title)
    emit("rename", conversation, title);
}

function confirmRemove(conversation: AiConversation) {
  confirm.require({
    header: t("chat_delete_header", "Delete conversation", "Usuń rozmowę"),
    message: t(
      "chat_delete_message",
      "Are you sure you want to delete {title}?",
      "Czy na pewno chcesz usunąć {title}?",
      { title: conversation.title },
    ),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("chat_delete", "Delete", "Usuń"),
    rejectLabel: t("chat_cancel", "Cancel", "Anuluj"),
    acceptProps: { severity: "danger" },
    rejectProps: { severity: "secondary", outlined: true },
    accept: () => emit("remove", conversation),
  });
}
</script>

<template>
  <div class="flex flex-col gap-2 p-3">
    <Button
      :label="t('chat_new', 'New conversation', 'Nowa rozmowa')"
      icon="pi pi-plus"
      severity="secondary"
      class="justify-start!"
      :disabled="disabled"
      @click="emit('new')"
    />
    <div class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
      <template v-for="group in groups" :key="group.label">
        <h2
          class="text-eaf-ink-muted px-3 pt-3 pb-1 text-[0.65625rem] font-semibold tracking-[0.7px] uppercase first:pt-1"
        >
          {{ group.label }}
        </h2>
        <template v-for="c in group.conversations" :key="c.id">
          <InputText
            v-if="renamingId === c.id"
            v-model="renameDraft"
            v-focus
            size="small"
            fluid
            :aria-label="t('chat_rename', 'Rename', 'Zmień nazwę')"
            @keydown.enter.prevent="finishRename(c)"
            @keydown.esc="renamingId = null"
            @blur="finishRename(c)"
          />
          <div
            v-else
            class="group flex items-center rounded-md"
            :class="c.id === activeId ? 'bg-emphasis' : 'hover:bg-emphasis'"
          >
            <button
              type="button"
              class="min-w-0 flex-1 cursor-pointer truncate px-3 py-2 text-left"
              :disabled="disabled"
              @click="emit('select', c.id)"
            >
              {{ c.title }}
            </button>
            <button
              type="button"
              class="cursor-pointer py-2 pr-3 pl-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              :aria-label="t('chat_options', 'Options', 'Opcje')"
              :disabled="disabled"
              @click="openMenu($event, c)"
            >
              <i class="pi pi-ellipsis-h" />
            </button>
          </div>
        </template>
      </template>
    </div>
    <Menu ref="menu" :model="menuItems" popup />
  </div>
</template>
