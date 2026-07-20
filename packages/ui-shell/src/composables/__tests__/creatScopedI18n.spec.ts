import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { createEafI18n } from "../createEafI18n";
import { I18nConfig } from "../../types";
import { createScopedI18n } from "../createScopedI18n";
import { useI18n } from "vue-i18n";

const messages = {
  en: {
    login: {
      title: "Login",
    },
    users_count: "{count} users",
  },
  pl: {
    login: {
      title: "Logowanie",
    },
    users_count: "{count} użytkowników",
  },
};

const i18nConfig: I18nConfig = {
  defaultLanguage: "en",
  supportedLanguages: [
    { localeCode: "en", displayNameKey: "english" },
    { localeCode: "pl", displayNameKey: "polish" },
  ],
  messages: messages,
};

function withSetup<T>(composable: () => T) {
  let result!: T;
  const { i18n } = createEafI18n([], i18nConfig);
  const wrapper = mount(
    {
      setup() {
        result = composable();
        return () => null;
      },
    },
    {
      global: {
        plugins: [i18n],
      },
    },
  );
  return { result, wrapper };
}

describe("createScopedI18n", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should create a scoped i18n function and fallback to default inline message", async () => {
    const messages = {
      en: {
        scopedMsg: "Message in English",
      },
      pl: {
        scopedMsg: "Wiadomość w języku polskim",
      },
    };
    const { result } = withSetup(() => {
      const useScopedI18n = createScopedI18n({});
      const scopedI18n = useScopedI18n();
      const globalI18n = useI18n({ useScope: "global" });
      return { scopedI18n, globalI18n };
    });
    const { scopedI18n, globalI18n } = result;

    expect(
      scopedI18n.t("scopedMsg", messages.en.scopedMsg, messages.pl.scopedMsg),
    ).toBe(messages.en.scopedMsg);
    globalI18n.locale.value = "pl";
    await nextTick();
    expect(
      scopedI18n.t("scopedMsg", messages.en.scopedMsg, messages.pl.scopedMsg),
    ).toBe(messages.pl.scopedMsg);
  });
});
