import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "./markdownRender";

describe("renderMarkdownToHtml", () => {
  it("renders headings, task lists and links", () => {
    const html = renderMarkdownToHtml("# 标题\n- [x] 完成\n- [ ] 待办\n[链接](https://example.com)");
    expect(html).toContain("<h1>标题</h1>");
    expect(html).toContain("checked");
    expect(html).toContain('href="https://example.com"');
  });

  it("escapes raw html", () => {
    expect(renderMarkdownToHtml("<script>alert(1)</script>")).toContain("&lt;script&gt;");
  });
});
