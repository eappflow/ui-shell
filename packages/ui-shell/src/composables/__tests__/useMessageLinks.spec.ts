import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMessageLinks } from "../useMessageLinks";

const { router, confirm } = vi.hoisted(() => ({
  router: { push: vi.fn() },
  confirm: { require: vi.fn() },
}));

vi.mock("vue-router", () => ({ useRouter: () => router }));
vi.mock("primevue/useconfirm", () => ({ useConfirm: () => confirm }));
vi.mock("../useScopedI18n", () => ({
  useScopedI18n: () => ({ t: (key: string) => key }),
}));

function clickOn(href: string | null) {
  const target = document.createElement(href === null ? "span" : "a");
  if (href !== null) target.setAttribute("href", href);
  const event = { target, preventDefault: vi.fn() } as unknown as MouseEvent;
  useMessageLinks().followLink(event);
  return event;
}

describe("useMessageLinks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens links into the app through the router", () => {
    const event = clickOn("/settings");

    expect(event.preventDefault).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/settings");
    expect(confirm.require).not.toHaveBeenCalled();
  });

  it("asks before opening an external link, then opens it in a new tab", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    clickOn("https://example.com");
    expect(open).not.toHaveBeenCalled();
    confirm.require.mock.calls[0]![0].accept();

    expect(open).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer",
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it("ignores clicks outside links", () => {
    const event = clickOn(null);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(confirm.require).not.toHaveBeenCalled();
  });
});
