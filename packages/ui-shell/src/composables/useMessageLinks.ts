import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useScopedI18n } from "./useScopedI18n";
import { isAppPath } from "../utils/isAppPath";

/** Links in the model's replies: the app's own open in place, others after asking */
export function useMessageLinks() {
  const router = useRouter();
  const confirm = useConfirm();
  const { t } = useScopedI18n();

  function followLink(event: MouseEvent) {
    const href = (event.target as HTMLElement)
      .closest("a")
      ?.getAttribute("href");
    if (!href) return;
    event.preventDefault();

    if (isAppPath(href)) {
      router.push(href);
      return;
    }

    confirm.require({
      header: t(
        "chat_external_link_header",
        "Leave the app?",
        "Opuścić aplikację?",
      ),
      message: t(
        "chat_external_link_message",
        "This link leads outside the app, to {url}. Open it in a new tab?",
        "Ten link prowadzi poza aplikację, do {url}. Otworzyć go w nowej karcie?",
        { url: href },
      ),
      icon: "pi pi-exclamation-circle",
      acceptLabel: t("chat_open", "Open", "Otwórz"),
      rejectLabel: t("chat_cancel", "Cancel", "Anuluj"),
      rejectProps: { severity: "secondary", outlined: true },
      accept: () => window.open(href, "_blank", "noopener,noreferrer"),
    });
  }

  return { followLink };
}
