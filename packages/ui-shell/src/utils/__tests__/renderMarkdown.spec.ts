import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../renderMarkdown";

describe("renderMarkdown", () => {
  it("renders markdown and keeps links into the app", () => {
    const html = renderMarkdown("**Saved:**\n- [Settings](/settings)");

    expect(html).toContain("<strong>Saved:</strong>");
    expect(html).toContain('<a href="/settings">Settings</a>');
  });

  it("keeps only what markdown makes out of the model's HTML", () => {
    const html = renderMarkdown(
      [
        "<script>x()</script>",
        'a <b onclick="x()">b</b>',
        "[c](javascript:x())",
        "![d](https://example.com/d.png)",
        '<form action="https://example.com"><input type="password"></form>',
        '<div style="position:fixed" id="app">e</div>',
        '<video src="https://example.com/v.mp4" autoplay></video>',
      ].join("\n\n"),
    );

    expect(html).toContain("<b>b</b>");
    expect(html).not.toMatch(
      /<script|onclick|javascript:|<img|<form|<input|style=|id=|<video/,
    );
  });
});
